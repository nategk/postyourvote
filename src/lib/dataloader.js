import fetch from 'node-fetch'
import Papa from 'papaparse'

function csvToObject(csvData) {
  let fields = csvData[0];
  var objects = {};
  csvData.slice(1).forEach(row => {
    let obj = {};
    row.forEach((el, i) => {
      if (!el || !fields[i]) {
        return;
      }
      obj[fields[i]] = el;
    })
    objects[row[0]] = obj;
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
