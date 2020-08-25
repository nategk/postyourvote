import { Router } from 'express'
import { get as queryLocation, queryLatLng } from '../lib/placesearch.js'
import { urlFriendly } from '../lib/utils.js'
import airtableDataloader from '../lib/airtableDataloader.js'
import logger from '../lib/logger.js'

var router = Router();

router.get('/choose-location', function(req, res) {
  res.render('choose-location', { title: 'Choose a location' });
});

router.post('/choose-location', async function(req, res) {
  logger.info("location query", req.body.query);
  let postalResults = await queryLocation(req.app.get('db'), req.body.query);
  // logger.info("Postal results", postalResults);
  if (postalResults.status == 'success' && postalResults.data.length == 1) {
    let stateKey = urlFriendly(postalResults.data[0].state);
    let countyKey = urlFriendly(postalResults.data[0].county);
    let cache = req.app.get('cache');
    let regions = await cache.get(`${stateKey}/${countyKey}`, async () => {
      let airtable = req.app.get('airtable');
      return await airtableDataloader(airtable, stateKey, countyKey);
    });
    if (regions.length == 1) {
      res.redirect(301, regions[0].url);
      return;
    }
  }
  res.render('choose-location', {
    title: 'Choose your location',
    error: "Sorry, we couldn't find that postal code"
  });
});

router.get('/location-query.json', async function(req, res) {
  var locationResults;
  if (req.query.q) {
    locationResults = await queryLocation(req.app.get('db'), req.query.q);
  } else if (req.query.lat && req.query.lng) {
    locationResults = await queryLatLng(req.app.get('db'), req.query.lat, req.query.lng);
  } else {
    res.status(400).json({status: "error", message: "either q or lat/lng queries required"});
  }
  res.json(locationResults);
});

router.get('/raw-data', async function(req, res) {
  let cache = req.app.get('cache');
  let stateKey = 'wisconsin';
  // let countyKey = 'palm-beach';
  let countyKey = null;
  let regionData = await cache.get(`${stateKey}/${countyKey}`, async () => {
    let airtable = req.app.get('airtable');
    return await airtableDataloader(airtable, stateKey, countyKey);
  });
  res.send(regionData);
});

export default router;
