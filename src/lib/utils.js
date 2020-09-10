import airtableDataloader from '../lib/airtableDataloader.js'
import logger from './logger.js';

function urlFriendly(value) {
  return value == undefined ? '' : value.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

async function getRegion(req, state, county) {
  const stateKey = urlFriendly(state);
  const countyKey = urlFriendly(county);
  let cache = req.app.get('cache');
  const region = await cache.get(stateKey, async () => {
    let airtable = req.app.get('airtable');
    const results = await airtableDataloader(airtable, stateKey)
    return results ? results[0] : null;
  });
  if (county) {
    if (!region || !region.counties || !region.counties[countyKey]) {
      // logger.error("Couldn't find state", stateKey);
      throw `Couldn't find region for state: ${state} county: ${county}`;
    }
    return region.counties[countyKey];
  } else {
    if (!region) {
      throw `Couldn't find region for state: ${state}`;
    }
    return region;
  }
}

export { urlFriendly, getRegion }
