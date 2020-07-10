import fetch from 'node-fetch'

const queryParams = {
  username: "voteremote",
  maxRows: 10,
  country: "US",
  // featureclasses: "A,P" // TODO: make this more specific feature codes
  featureCode: ['ADM1', 'ADM2', 'ADM3', 'PPLA2']
};
const urlBase = "http://api.geonames.org/searchJSON";
async function get(q) {
  return new Promise(async (resolve) => {
    try {
      var params = {
        q,
        ...queryParams
      }
      var esc = encodeURIComponent;
      var query = Object.keys(params)
          .map(k => {
            if (Array.isArray(params[k])) {
              return params[k].map(v => esc(k) + '=' + esc(v)).join('&');
            } else {
              return esc(k) + '=' + esc(params[k]);
            }
          })
          .join('&');
      let url = urlBase + '?' + query;
      console.log("URL", url);
      let response = await fetch(url);
      let responseJson = await response.json();
      let data = responseJson.geonames.map(result => {
        return {
          name: result.name,
          geonameId: result.geonameId,
          lng: result.lng,
          lat: result.lat,
          state: result.adminName1,
          stateCode: result.adminCode1
        }
      });
      resolve({status: "success", data});
    }
    catch (err) {
      console.error("Error getting CSV data", err);
      resolve({status: "error", message: err});
    }
  });
}

export default get;
