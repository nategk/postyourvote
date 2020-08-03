import fetch from 'node-fetch'
import Papa from 'papaparse'

const csvFieldToObjKey = {
  'State Name': 'stateName',
  'State URL': 'stateUrl',
  'County Name': 'countyName',
  'County URL': 'countyUrl',
  'Ballot Request Method': 'ballotRequestMethod',
  'VBM Estimated Request-By Date': 'ballotRequestDeadline',
  'VBM Estimated Mail-By Date': 'ballotMailDeadline',
  'Online Ballot Request Requirements': 'ballotRequestRequirements',
  'Need to be registered to VBM?': 'needToBeRegistered',
  'Need a reason or excuse to VBM?': 'needReason',
  'Reasons or excuses needed to VBM': 'reasonsNeeded',
  'Online Ballot Request URL': 'onlineBallotRequestURL',
}

function mapCsvValue(csvValue) {
  if (csvValue && csvValue.toLowerCase() != 'n/a') {
    return csvValue;
  } else {
    return null;
  }
}

function mapCsvRow(row) {
  let obj = {};
  for (const fieldName in csvFieldToObjKey) {
    let key = csvFieldToObjKey[fieldName];
    obj[key] = mapCsvValue(row[fieldName]);
  }
  return obj;
}

function csvToObject(csvData) {
  let fields = csvData[0];
  var objects = {};
  csvData.slice(1).forEach(row => {
    let obj = {};
    row.forEach((el, i) => {
      if (!fields[i]) {
        return;
      }
      obj[fields[i]] = el;
    });
    obj = mapCsvRow(obj);
    if (obj.countyUrl) {
      if (!objects[obj.stateUrl]) {
        objects[obj.stateUrl] = {
          stateUrl: obj.stateUrl,
          stateName: obj.stateName,
          counties: {}
        };
      }
      objects[obj.stateUrl].counties[obj.countyUrl] = obj;
    } else {
      objects[obj.stateUrl] = obj;
    }
  })
  return objects
}

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQMKrjGL05YBTjuuviiAcbmyPy8aw_NZ0ViaZohWdWgZVDm_dsMKpR0yUSktNbKC6D_JKVmO6042FH7/pub?gid=415018427&single=true&output=csv";
async function get() {
  try {
    return new Promise(async (resolve) => {
      let response = await fetch(url);
      let csvText = await response.text();
      Papa.parse(csvText, {
        complete: (results, file) => {
          // console.log("Parsing complete:", results, file);
          let data = csvToObject(results.data);
          resolve(data);
        },
        error: (error, file) => {
          console.log("Error", error, file)
          resolve(error);
        }
      });
    });
  }
  catch (err) {
    console.error("Error getting CSV data", err);
    return err;
  }
}

export default get;
