// var express = require('express');
import { Router } from 'express'
var router = Router();

import loadData from '../lib/dataloader.js'

// Static paths

router.get('/', async function(req, res, next) {
  let csvData = await req.app.get('cache').get('states', loadData);
  // Temporarily fixing Minnesota
  var state = 'minnesota';
  var thisState = csvData[state];
  res.locals.path = req.path;
  if (state) {
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
  // let csvData = await loadData();
  let csvData = await req.app.get('cache').get('states', loadData);
  res.send(csvData);
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
  var thisState = csvData[req.params.state];
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
