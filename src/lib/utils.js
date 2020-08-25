import airtableDataloader from '../lib/airtableDataloader.js'

function urlFriendly(value) {
  return value == undefined ? '' : value.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

async function getRegion(req, state, county) {
  var stateKey = urlFriendly(state);
  var countyKey = urlFriendly(county);
  let cache = req.app.get('cache');
  let regions = await cache.get(stateKey, async () => {
    let airtable = req.app.get('airtable');
    return await airtableDataloader(airtable, stateKey);
  });
  if (county) {
    if (regions.length != 1 || !regions[0].counties || !regions[0].counties[countyKey]) {
      // logger.error("Couldn't find state", stateKey);
      // return next();
      throw `Couldn't find region for state: ${state} county: ${county}`;
    }
    return regions[0].counties[countyKey];
  } else {
    if (regions.length != 1) {
      throw `Couldn't find region for state: ${state}`;
    }
    return regions[0];
  }
}

export { urlFriendly, getRegion }
