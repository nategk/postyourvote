import fetch from 'node-fetch'
import logger from './logger.js'

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
    logger.info("Location %s %s", response.status, location);
    return location;
  } catch (err) {
    logger.error("Couldn't fetch IP location: %s", err);
    return {"status": "fail", "message": String(err)};
  }
}

export default getIPLocation;
