var express = require('express');
var router = express.Router();

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

router.get('/get-reminder/', function(req, res, next) {
  res.locals.path = req.path;
  res.render('get-reminder', { title: 'Get a reminder' });
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

module.exports = router;
