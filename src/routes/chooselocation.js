import { Router } from 'express'
import { get as queryLocation, queryLatLng } from '../lib/placesearch.js'
import { urlFriendly } from '../lib/utils.js'
import loadData from '../lib/dataloader.js'

var router = Router();

router.get('/choose-location', function(req, res, next) {
  res.locals.path = req.path;
  res.render('choose-location', { title: 'Choose a location' });
});

router.post('/choose-location', async function(req, res, next) {
  console.log("location query", req.body.query);
  let postalResults = await queryLocation(req.app.get('db'), req.body.query);
  console.log("Postal results", postalResults);
  if (postalResults.status == 'success' && postalResults.data.length == 1) {
    let stateUrl = urlFriendly(postalResults.data[0].state);
    let countyUrl = urlFriendly(postalResults.data[0].county);
    let csvData = await req.app.get('cache').get('states', loadData);
    let locationResults = csvData[stateUrl];
    if (locationResults.counties && locationResults.counties[countyUrl]) {
      locationResults = locationResults.counties[countyUrl];
      res.redirect(301, "/"+locationResults.stateUrl+'/'+locationResults.countyUrl);
    } else {
      res.redirect(301, "/"+locationResults.stateUrl);
    }
  } else {
    res.render('choose-location', {
      title: 'Choose your location',
      error: "Sorry, we couldn't find that postal code"
    });
  }
});

router.get('/location-query.json', async function(req, res, next) {
  if (req.query.q) {
    var locationResults = await queryLocation(req.app.get('db'), req.query.q);
  } else if (req.query.lat && req.query.lng) {
    var locationResults = await queryLatLng(req.app.get('db'), req.query.lat, req.query.lng);
  } else {
    res.status(400).json({status: "error", message: "either q or lat/lng queries required"});
  }
  res.json(locationResults);
});

router.get('/raw-data', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  res.send(csvData);
});

export default router;
