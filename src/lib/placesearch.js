import fetch from 'node-fetch'

const queryParams = {
  username: "voteremote",
  maxRows: 10,
  country: "US",
  // featureclasses: "A,P" // TODO: make this more specific feature codes
  featureCode: ['ADM1', 'ADM2', 'ADM3', 'PPLA2']
};
const urlBase = "http://api.geonames.org/searchJSON";
async function getGeonames(q) {
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
      return {status: "success", data};
    }
    catch (err) {
      console.error("Error getting CSV data", err);
      return {status: "error", message: err};
    }
}

async function queryLatLng(db, lat, lng) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  // let postalcode = 53208;

  let result = await db.collection('postalcodes').findOne({
    center: {$near: {
      $geometry: {type: "Point", coordinates: [lng, lat]}, 
      $maxDistance: 10000
    }}
  });
  if (result) {
    return {
      status: "success",
      data: [
        {
          name: result["place name"],
          lng: result.longitude,
          lat: result.latitude,
          state: result["admin name1"],
          stateCode: result["admin code1"],
          county: result["admin name2"]
        }
      ]
    };
  } else {
    return {
      status: "error", message: "no result"
    };
  }
}

async function getPostalcode(db, postalcode) {
  postalcode = parseInt(postalcode);
    let result = await db.collection('postalcodes').findOne({"postal code": postalcode});
    if (result) {
      return {
        status: "success",
        data: [
          {
            name: result["place name"],
            lng: result.longitude,
            lat: result.latitude,
            state: result["admin name1"],
            stateCode: result["admin code1"],
            county: result["admin name2"]
          }
        ]
      };
    } else {
      return {
        status: "error", message: "no result"
      };
    }
}

function isPostalcode(q) {
  // Determine if the q is a 5 digit number
  return (!isNaN(parseInt(q)) && q.length == 5);
}

async function get(db, q) {
  if (isPostalcode(q)) {
    return getPostalcode(db, q);
  } else {
    return getGeonames(q);
  }
}

export { getGeonames, queryLatLng, getPostalcode, isPostalcode, get };
export default get
