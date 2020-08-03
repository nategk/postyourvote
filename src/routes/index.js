import { Router } from 'express'
import loadData from '../lib/dataloader.js'
import getIpLocation from '../lib/iplocation.js'
import chooseLocationRouter from './chooselocation.js'
import markdown from 'marked'

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
      URL: thisState.stateUrl,
      name: thisState.stateName,
      ...thisState
    });
  } else {
    res.render('home', { title: 'Vote Remote 2020' });
  }
});

// Add all the location choosing routes
router.use(chooseLocationRouter);

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

// Variable paths

router.get('/:state/mail-in-ballot-reminder', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  var thisState = csvData[req.params.state];
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-reminder', {
    title: `${thisState.stateName} reminder to mail ballot`,
    name: thisState.stateName,
    ...thisState
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
    title: `${thisLocation.countyName} county, ${thisLocation.stateName} rules`,
    URL: thisLocation.stateUrl+'/'+thisLocation.countyUrl,
    ...thisLocation,
    markdown: markdown
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
      title: `${thisLocation.stateName} counties`,
      counties: thisLocation.counties
    });
  } else {
    res.render('location-rules', {
      title: `Vote by mail in ${thisLocation.stateName}`,
      URL: thisLocation.stateUrl,
      name: thisLocation.stateName,
      ...thisLocation,
      markdown: markdown
    });
  }
});

export default router;
