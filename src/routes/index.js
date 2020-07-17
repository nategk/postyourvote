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
    res.render('index-located', {
      title: 'Vote Remote 2020',
      URL: thisState['State URL'],
      name: thisState['State Name'],
      requestOnline: thisState['Online Ballot Request URL']
    });
  } else {
    res.render('index-generic', { title: 'Vote Remote 2020' });
  }
});

router.get('/change-location', function(req, res, next) {
  res.locals.path = req.path;
  res.render('change-location', { title: 'Change your location' });
});

router.post('/change-location', async function(req, res, next) {
  console.log("location query", req.body.query);
  let locationResults = await queryLocation(req.app.get('db'), req.body.query);
  console.log("Location", locationResults);
  if (locationResults.status == 'success' && locationResults.data.length == 1) {
    res.redirect(301, "/"+urlFriendly(locationResults.data[0].state));
  } else {
    res.render('change-location', { 
      title: 'Change your location', 
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
  var thisState = csvData[stateKey];
  if (thisState == undefined) {
    console.error("Couldn't find county", stateKey);
    res.sendStatus(404);
    return;
  }
  console.log(thisState);
  res.locals.path = req.path;
  res.render('location-rules', {
    title: `${thisState['State Name']} county rules`,
    URL: thisState['State URL'],
    name: thisState['State Name'],
    ballotRequestMethod: thisState['Ballot Request Method'],
    vbmDueDate: thisState['VBM Due Date'],
    ballotRequestRequirements: thisState['Ballot Request Requirements'],
    onlineBallotRequestURL: thisState['Online Ballot Request URL']
  });
});

router.get('/:state/', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  var stateKey = req.params.state.toLowerCase();
  var thisState = csvData[stateKey];
  if (thisState == undefined) {
    console.error("Couldn't find state", stateKey);
    res.sendStatus(404);
    return;
  }
  console.log(thisState);
  res.locals.path = req.path;
  res.render('location-rules', {
    title: `${thisState['State Name']} state rules`,
    URL: thisState['State URL'],
    name: thisState['State Name'],
    ballotRequestMethod: thisState['Ballot Request Method'],
    ballotRequestDeadline: thisState['Ballot Request Deadline'],
    ballotRequestRequirements: thisState['Ballot Request Requirements'],
    reasonsNeeded: thisState['VBM Reason(s) Needed'],
    onlineBallotRequestURL: thisState['Online Ballot Request URL']
  });
});

// module.exports = router;
export default router;
