import fetch from 'node-fetch'

async function getIPLocation(req) {
  var ipAddr = req.connection.remoteAddress;
  
  // TODO: debug for running locally
  if (ipAddr == "::1") {
    ipAddr = "157.131.203.252";
  }

  const url = `http://ip-api.com/json/${ipAddr}?fields=status,message,country,countryCode,region,regionName,city,zip,timezone,mobile,proxy,hosting,query`;
  try {
    let response = await fetch(url);
    let location = await response.json();
    // TODO check status code
    console.log("Location", response.status, location);
    return location;
  } catch (err) {
    console.err("Couldn't fetch IP location", err);
    return {"status": "fail", "message": String(err)};
  }
}

export default getIPLocation;
