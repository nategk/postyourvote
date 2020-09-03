import fetch from 'node-fetch';
import moment from 'moment'

import { connectToAirtable } from '../src/lib/db.js'
import logger from '../src/lib/logger.js';

var airtable = connectToAirtable();

// Example: https://api.voteamerica.com/v1/election/state/CA/
// Docs: https://docs.voteamerica.com/api/

// const baseName = 'TEST State Rules';
const baseName = 'State Rules';

const electionDay = '2020-11-03';
const daysBeforeElectionRe = /(?<when>Received|Postmarked)?\s?(?<days>\d+) days? (before|prior to) (Election Day|an election)/i;
const postmarkedOrReceivedByElectionRe = /(?<when>Received|Postmarked) by( NOON on)? Election Day/i;

function relativeDate(dateText) {
  if (['n/a', 'varies by county', 'no specific deadline'].includes(dateText.toLowerCase())) return null;
  try {
    let matches = postmarkedOrReceivedByElectionRe.exec(dateText);
    if (matches) {
      return moment(electionDay).format('YYYY-MM-DD');
    } else {
      matches = daysBeforeElectionRe.exec(dateText);
      // logger.info("Parse dateText: %s, %O", dateText2, matches.groups.days);
      return moment(electionDay).subtract(matches.groups.days, 'days').format('YYYY-MM-DD');
    }
  }
  catch (err) {
    logger.error("Couldn't parse relative date: '%s'", dateText);
    throw err;
  }
}

function postmarkedOrDelivered(dateText) {
  if (dateText.toLowerCase() == 'n/a' || dateText.toLowerCase() == 'varies by county') return null;
  try {
    let matches = postmarkedOrReceivedByElectionRe.exec(dateText);
    if (!matches) {
      matches = daysBeforeElectionRe.exec(dateText);
    }
    return matches.groups.when;
  }
  catch (err) {
    logger.error("Couldn't parse relative date: '%s'", dateText);
    throw err;
  }
}

const fieldMap = {
  'VBM Excuse Required?': r => !r.vbm_no_excuse.value,
  'VBM Excuses': 'vbm_absentee_ballot_rules',
  'Online Voter Registration Deadline': r => {
    return relativeDate(r.registration_deadline_online.text);
  },
  'Official Ballot Request Due': r => {
    return relativeDate(r.vbm_deadline_online.text);
  },
  'Ballot Request Needs': r => {
    return [
      r.vbm_application_directions.text,
      r.id_requirements_vbm.text
    ].filter(i => !!i).join("\n");
  },
  'Online Ballot Request URL': 'external_tool_vbm_application',
  'Check Voter Registration Status URL': 'external_tool_verify_status',
  'Check VBM Status URL': 'external_tool_absentee_ballot_tracker',
  'Early Voting Start Date': r => {
    return relativeDate(r.early_voting_starts.text);
  },
  'Early Voting End Date': r => {
    return relativeDate(r.early_voting_ends.text);
  },
  'Ballot Officially Due': r => {
    return relativeDate(r.vbm_voted_ballot_deadline_mail.text);
  },
  'Ballot Due Postmarked or Delivered': r => {
    return postmarkedOrDelivered(r.vbm_voted_ballot_deadline_mail.text);
  },
  // 'VBM Ballot In-Person Delivery': 'vbm_absentee_ballot_rules',
  'PDF Application URL': 'pdf_absentee_form',
  'Secretary of State URL': 'sos_election_website',
  'Secretary of State Phone': 'sos_phone_number',
  'Secretary of State Email': 'sos_contact_email'
};

const uniqueCountyFields = [
  'Online Ballot Request URL',
  'Check VBM Status URL',
  'PDF Application URL',
  'Check Voter Registration Status URL'
];

function mapVAtoPYV(vaState, hasCounties) {
  let pyvState = {};
  for (const [pyvField, vaField] of Object.entries(fieldMap)) {
    if (hasCounties && uniqueCountyFields.includes(pyvField)) {
      continue;
    }
    if (typeof vaField === "function") {
      pyvState[pyvField] = vaField(vaState);
    } else {
      if (vaState[vaField].value === undefined) {
        pyvState[pyvField] = vaState[vaField].text;
      } else {
        pyvState[pyvField] = vaState[vaField].value;
      }
    }
  }

  return pyvState;
}

async function getStateList() {
  var stateList = [];
  await airtable(baseName).select({
    view: "Grid view",
    fields: ["State shortname", "URL"],
    // maxRecords: 3 // TODO: debug
  }).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
      stateList.push({
        id: record.id,
        stateCode: record.get('State shortname'),
        url: record.get('URL')
      });
    });
    fetchNextPage();
  });
  var stateCodesIds = {};
  for (let state of stateList) {
    if (!state.stateCode) continue;
    if (!stateCodesIds[state.stateCode]) {
      stateCodesIds[state.stateCode] = [];
    }
    stateCodesIds[state.stateCode].push(state.id);
  }
  return stateCodesIds;
}

async function getVoteAmericaState(stateCode) {
  const url = `https://api.voteamerica.com/v1/election/state/${stateCode}/`;
  let response = await fetch(url);
  let jsonResponse = await response.json();
  let vaState = {};
  for (const fieldObj of jsonResponse.state_information) {
    vaState[fieldObj.field_type] = {
      text: fieldObj.text, 
      value: fieldObj.value, 
      modified_at: fieldObj.modified_at
    };
  }
  return vaState;
}

async function updatePYVState(pyvId, pyvState) {
  return airtable(baseName).update([{
    id: pyvId,
    fields: pyvState
  }], 
  function(err) {
    if (err) {
      logger.error("Error updating %s: %s", pyvId, err);
    }
  });
}

(async () => {
  var states = await getStateList();
  for (const [stateCode, pyvIds] of Object.entries(states)) {
    const vaState = await getVoteAmericaState(stateCode);
    const hasCounties = pyvIds.length > 1;
    const pyvState = mapVAtoPYV(vaState, hasCounties);
    logger.info("State for %s: %O", stateCode, pyvState);
    for (const pyvId of pyvIds) {
      await updatePYVState(pyvId, pyvState);
    }
    // break; //TODO: debug
  }
  // const stateCode = 'AK';
  // const vaState = await getVoteAmericaState(stateCode);
  // const pyvState = mapVAtoPYV(vaState);
  // logger.info("State for %s: %O", stateCode, pyvState);
})();

