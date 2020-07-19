import { Router } from 'express'
import loadData from '../lib/dataloader.js'
import getIpLocation from '../lib/iplocation.js'
import queryLocation from '../lib/placesearch.js'
import {urlFriendly } from '../lib/utils.js'

var router = Router();

// Static paths

router.get('/', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  let location = await getIpLocation(req);
  res.locals.path = req.path;
  if (location.status == "success" && !location.mobile && csvData[location.regionName.toLowerCase()] != undefined) {
    var stateName = location.regionName.toLowerCase();
    var thisState = csvData[stateName];
    res.render('home', {
      title: 'Vote Remote 2020',
      URL: thisState['State URL'],
      name: thisState['State Name'],
      requestOnline: thisState['Online Ballot Request URL']
    });
  } else {
    res.render('home', { title: 'Vote Remote 2020' });
  }
});

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
      res.redirect(301, "/"+locationResults['State URL']+'/'+locationResults['County URL']);
    } else {
      res.redirect(301, "/"+locationResults['State URL']);
    }
  } else {
    res.render('choose-location', {
      title: 'Choose your location',
      error: "Sorry, we couldn't find that postal code"
    });
  }
});

router.get('/about', function(req, res, next) {
  res.locals.path = req.path;
  res.render('about', { title: 'About' });
});

router.get('/share', function(req, res, next) {
  res.locals.path = req.path;
  res.render('share', { title: 'Share' });
});

router.get('/get-mail-in-ballot-status', function(req, res, next) {
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-status', { title: 'Mail-in ballot status' });
});

router.get('/get-voter-registration-status', function(req, res, next) {
  res.locals.path = req.path;
  res.render('get-voter-registration-status', { title: 'Voter registration status' });
});

router.get('/raw-data', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  res.send(csvData);
});

router.get('/location-query.json', async function(req, res, next) {
  let locationResults = await queryLocation(req.app.get('db'), req.query.q);
  res.json(locationResults);
});

// Variable paths

router.get('/:state/mail-in-ballot-reminder', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  var thisState = csvData[req.params.state];
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-reminder', {
    title: `${thisState['State Name']} reminder to mail ballot`,
    name: thisState['State Name'],
    ballotRequestDeadline: thisState['Ballot Request Deadline'],
    onlineBallotRequestURL: thisState['Online Ballot Request URL']
  });
});

router.get('/:state/:county', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  var stateKey = req.params.state.toLowerCase();
  var countyKey = req.params.county.toLowerCase();
  var thisState = csvData[stateKey];
  if (thisState == undefined) {
    console.error("Couldn't find state", stateKey);
    res.sendStatus(404);
    return;
  }
  var thisLocation = thisState.counties[countyKey];
  if (thisLocation == undefined) {
    console.error("Couldn't find county", countyKey, "in state", countyKey);
    // TODO go to county index
    res.sendStatus(404);
    return;
  }

  console.log(thisLocation);
  res.locals.path = req.path;
  res.render('location-rules', {
    title: `${thisLocation['County Name']} county, ${thisLocation['State Name']} rules`,
    URL: thisLocation['State URL']+'/'+thisLocation['County URL'],
    name: thisLocation['State Name'],
    ballotRequestMethod: thisLocation['Ballot Request Method'],
    vbmDueDate: thisLocation['VBM Due Date'],
    ballotRequestRequirements: thisLocation['Ballot Request Requirements'],
    onlineBallotRequestURL: thisLocation['Online Ballot Request URL']
  });
});

router.get('/:state/', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  var stateKey = req.params.state.toLowerCase();
  var thisLocation = csvData[stateKey];
  if (thisLocation == undefined) {
    console.error("Couldn't find state", stateKey);
    res.sendStatus(404);
    return;
  }
  console.log(thisLocation);
  res.locals.path = req.path;
  if (thisLocation.counties) {
    res.render('state-counties-list', {
      title: `${thisLocation['State Name']} counties`,
      counties: thisLocation.counties
    });
  } else {
    res.render('location-rules', {
      title: `${thisLocation['State Name']} state rules`,
      URL: thisLocation['State URL'],
      name: thisLocation['State Name'],
      ballotRequestMethod: thisLocation['Ballot Request Method'],
      ballotRequestDeadline: thisLocation['Ballot Request Deadline'],
      ballotRequestRequirements: thisLocation['Ballot Request Requirements'],
      reasonsNeeded: thisLocation['VBM Reason(s) Needed'],
      onlineBallotRequestURL: thisLocation['Online Ballot Request URL']
    });
  }
});

export default router;
