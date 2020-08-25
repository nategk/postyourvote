import logger from './logger.js'

const fieldNameMap = {
  url: 'URL',
  stateName: 'State Name',
  stateKey: 'State Key',
  countyName: 'County Name',
  countyKey: 'County Key',
  PYVBucket: 'Bucket',
  ballotRequestMethod: 'Method- Ballot Request',
  needReason: 'VBM Excuse Required?',
  covidAsExcuse: "Covid as excuse?",
  needToBeRegistered: 'Need to be registered to VBM?',
  timezone: 'Timezone',
  voterRegistrationDeadline: 'Voter Registration Deadline',
  officialBallotRequestDue: 'Official Ballot Request Due',
  recommendedReceivedByDate: 'Recommended Received By Date',
  officialBallotReturnDate: 'Official Ballot Return Date',
  recommendedBallotReturnDate: 'Recommended Ballot Return Date',
  ballotRequestRequirements: 'Ballot Request Needs',
  onlineBallotRequestURL: 'Online Ballot Request URL',
  checkVoterRegistrationStatusUrl: 'Check Voter Registration Status URL',
  checkVBMStatusUrl: 'Check VBM Status URL',
  earlyVotingStartDate: 'Early Voting Start Date',
  earlyVotingEndDate: 'Early Voting End Date',
  officialBallotDueDate: 'Ballot Officially Due',
  VBMBallotNeeds: 'VBM Ballot Needs',
  ballotDuePostmarkedOrDelivered: 'Ballot Due Postmarked or Delivered',
  returnBallotInPerson: 'VBM Ballot In-Person Delivery',
  vbmRulesUrl: 'VBM/Absentee rules URL',
  pdfApplicationLink: 'PDF Application Link',
  countyClerkInfoLink: 'County Clerk Info Link',
  ballotInstructions: 'Ballot Instructions'
}

function mapValue(val) {
  if (val && typeof val === 'string' && val.toLowerCase() === 'n/a') {
    return null;
  } else {
    return val;
  }
}

function mapRecordToObject(record) {
  let obj = {};
  for (const key in fieldNameMap) {
    let fieldName = fieldNameMap[key];
    let value = record.get(fieldName);
    if (value === undefined) {
      logger.warn("Field \"%s\" is undefined", fieldName);
    }
    try {
      obj[key] = mapValue(value);
    }
    catch (error) {
      logger.error("Couldn't understand value %s", value);
      throw error;
    }
  }
  return obj;
}

async function getRegion(airtableBase, stateKey, countyKey) {
  logger.info("Getting regions for %s %s", stateKey, countyKey);
  var regions = {};
  let filterFormula = null;
  if (stateKey && countyKey) {
    filterFormula = 
      `AND(
        {State Key} = "${stateKey}", 
        OR(
          {County Key} = "${countyKey}", 
          OR(
            {County Key} = "n/a",
            {County Key} = ""
          )
        )
      )`;
  } else if (stateKey) {
    filterFormula = `{State Key} = "${stateKey}"`;
  }
  await airtableBase('State Rules').select({
    view: "Grid view",
    filterByFormula: filterFormula,
    // fields: Object.values(fieldNameMap)
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
      const region = mapRecordToObject(record);
      // If this record is a county, but we didn't query specifically for it, add it to a list of
      // counties under the state.
      if (region.countyKey && region.countyKey != countyKey) {
        if (!regions[region.stateKey]) {
          regions[region.stateKey] = {
            stateKey: region.stateKey,
            stateName: region.stateName,
            url: region.stateKey,
            name: region.stateName,
            counties: {}
          }
        }
        region.name = `${region.countyName} County, ${region.stateName}`;
        regions[region.stateKey].counties[region.countyKey] = region;
      } else {
        region.name = region.stateName;
        regions[region.url] = region;
      }
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();
  });
  return Object.values(regions);
  // return regions;
}

export default getRegion;
