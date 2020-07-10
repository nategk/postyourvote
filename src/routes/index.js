import { Router } from 'express'
import loadData from '../lib/dataloader.js'
import getIpLocation from '../lib/iplocation.js'
import queryLocation from '../lib/placesearch.js'

var router = Router();

// Static paths

router.get('/', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  let location = await getIpLocation(req);
  
  res.locals.path = req.path;
  if (location.status == "success" && !location.mobile && csvData[location.regionName.toLowerCase()] != undefined) {
    var stateName = location.regionName.toLowerCase();
    var thisState = csvData[stateName];
    res.render('index-state', {
      title: 'Vote Remote 2020',
      URL: thisState.URL,
      name: thisState.Name
    });
  } else {
    res.render('index-generic', { title: 'Vote Remote 2020' });
  }
});

router.get('/change-location', function(req, res, next) {
  res.locals.path = req.path;
  res.render('change-location', { title: 'Change your location' });
});

router.post('/change-location', function(req, res, next) {

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

router.get('/location-query', async function(req, res, next) {
  let locationResults = await queryLocation(req.query.q);
  res.json(locationResults);
});

// Variable paths

router.get('/:state/mail-in-ballot-reminder', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  var thisState = csvData[req.params.state];
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-reminder', {
    title: `${thisState.Name} reminder to mail in ballot`,
    name: thisState.Name,
    ballotRequestDeadline: thisState['Ballot Request Deadline'],
    onlineBallotRequestURL: thisState['Online Ballot Request URL']
  });
});

router.get('/:state', async function(req, res, next) {
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
  res.render('state-rules', {
    title: `${thisState.Name} state rules`,
    URL: thisState.URL,
    name: thisState.Name,
    ballotRequestMethod: thisState['Ballot Request Method'],
    ballotRequestDeadline: thisState['Ballot Request Deadline'],
    ballotRequestRequirements: thisState['Ballot Request Requirements']
  });
});

// module.exports = router;
export default router;
