import { Router } from 'express'
// import loadData from '../lib/dataloader.js'
import airtableDataloader from '../lib/airtableDataloader.js'
import getIpLocation from '../lib/iplocation.js'
import chooseLocationRouter from './chooselocation.js'
import { urlFriendly } from '../lib/utils.js'
import markdown from 'marked'
import { getPostalcode } from '../lib/placesearch.js'

var router = Router();

// Static paths

router.get('/', async function(req, res) {
  let location = await getIpLocation(req);
  // DEBUG OVERRIDE
  // location = {status: 'success', zip: '33418'};
  if (location.status == "success" && !location.mobile) {
    let postalResults = await getPostalcode(req.app.get('db'), parseInt(location.zip));
    if (postalResults.status == 'success' && postalResults.data.length == 1) {
      let stateKey = urlFriendly(postalResults.data[0].state);
      let countyKey = urlFriendly(postalResults.data[0].county);
      let cache = req.app.get('cache');
      let regions = await cache.get(stateKey, async () => {
        let airtable = req.app.get('airtable');
        return await airtableDataloader(airtable, stateKey);
      });
      if (regions.length == 1) {
        let region = regions[0];
        let name = region.stateName;
        if (!region.counties || (region.counties && region.counties[countyKey])) {
          if (region.counties && region.counties[countyKey]) {
            region = region.counties[countyKey];
            name = `${region.countyName} County, ${region.stateName}`;
            console.log("County", name);
          }
          res.render('home', {
            located: true,
            ...region,
            name,
            url: '/'+region.url
          });
          return;
        }
      }
    }
  }
  // If we get this far, we haven't found a suitable location
  res.render('home', { located: false });
});

// Add all the location choosing routes
router.use(chooseLocationRouter);

router.get('/about', function(req, res) {
  res.locals.path = req.path;
  res.render('about', { title: 'About' });
});

router.get('/share', function(req, res) {
  res.locals.path = req.path;
  res.render('share', { title: 'Share' });
});

router.get('/get-mail-in-ballot-status', function(req, res) {
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-status', { title: 'Mail-in ballot status' });
});

router.get('/get-voter-registration-status', function(req, res) {
  res.locals.path = req.path;
  res.render('get-voter-registration-status', { title: 'Voter registration status' });
});

// Variable paths

router.get('/:state/mail-in-ballot-reminder', async function(req, res) {
  let stateKey = urlFriendly(req.params.state);
  let cache = req.app.get('cache');
  let regions = await cache.get(stateKey, async () => {
    let airtable = req.app.get('airtable');
    return await airtableDataloader(airtable, stateKey);
  });
  if (regions.length > 1 || regions[0].counties) {
    res.sendStatus(404);
    return;
  }
  let region = regions[0];
  res.render('get-mail-in-ballot-reminder', {
    name: region.stateName,
    ...region,
    markdown
  });
});

router.get('/:state/:county/mail-in-ballot-reminder', async function(req, res) {
  var stateKey = urlFriendly(req.params.state);
  var countyKey = urlFriendly(req.params.county);
  let cache = req.app.get('cache');
  let regions = await cache.get(stateKey, async () => {
    let airtable = req.app.get('airtable');
    return await airtableDataloader(airtable, stateKey);
  });
  if (regions.length != 1 || !regions[0].counties || !regions[0].counties[countyKey]) {
    console.error("Couldn't find state", stateKey);
    res.sentStatus(404);
    return;
  }
  let region = regions[0].counties[countyKey]
  console.log(region);
  res.render('get-mail-in-ballot-reminder', {
    name: `${region.countyName} County, ${region.stateName}`,
    ...region,
    markdown
  });
});

router.get('/:state/:county', async function(req, res) {
  var stateKey = urlFriendly(req.params.state);
  var countyKey = urlFriendly(req.params.county);
  let cache = req.app.get('cache');
  let regions = await cache.get(stateKey, async () => {
    let airtable = req.app.get('airtable');
    return await airtableDataloader(airtable, stateKey);
  });
  if (regions.length != 1 || !regions[0].counties || !regions[0].counties[countyKey]) {
    console.error("Couldn't find state", stateKey);
    res.sentStatus(404);
    return;
  }
  let region = regions[0].counties[countyKey]
  console.log(region);
  res.render('location-rules', {
    name: `${region.countyName} County, ${region.stateName}`,
    ...region,
    markdown
  });
});

router.get('/:state/', async function(req, res) {
  var stateKey = urlFriendly(req.params.state);
  let cache = req.app.get('cache');
  let regions = await cache.get(stateKey, async () => {
    let airtable = req.app.get('airtable');
    return await airtableDataloader(airtable, stateKey);
  });
  if (regions.length != 1) {
    console.error("Couldn't find state", stateKey);
    res.sendStatus(404);
    return;
  }
  let region = regions[0];
  console.log(region);
  if (region.counties) {
    res.render('state-counties-list', {
      ...region
    });
  } else {
    res.render('location-rules', {
      ...region,
      name: region.stateName,
      markdown
    });
  }
});

export default router;
