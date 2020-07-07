// var express = require('express');
import { Router } from 'express'
var router = Router();

import loadData from '../lib/dataloader.js'

router.get('/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('index', { title: 'Vote Remote 2020' });
});

router.get('/state-rules/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('state-rules', { title: 'Minnesota mail-in ballot' });
});

router.get('/change-location/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('change-location', { title: 'Change your location' });
});

router.get('/get-mail-in-ballot-reminder/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-reminder', { title: 'Get a reminder' });
});

router.get('/about/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('about', { title: 'About' });
});

router.get('/share/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('share', { title: 'Share' });
});

router.get('/get-mail-in-ballot-status/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-status', { title: 'Mail-in ballot status' });
});

router.get('/get-voter-registration-status/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('get-voter-registration-status', { title: 'Voter registration status' });
});

router.get('/raw-data', async function(req, res, next) {
  // let csvData = await loadData();
  let csvData = await req.app.get('cache').get('states', loadData);
  res.send(csvData);
});

// module.exports = router;
export default router;
