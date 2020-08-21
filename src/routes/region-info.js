import { Router } from 'express'
import { getRegion } from '../lib/utils.js'
import markdown from 'marked'
import { createRequestBallotGoogle } from './reminders.js'

var router = Router();

router.get('/:state/mail-in-ballot-reminder', async function(req, res, next) {
  var region = null;
  try {
    region = await getRegion(req, req.params.state)
  }
  catch(err) {
    console.error(err);
    return next();
  }
  
  if (region.counties) {
    return next();
  }

  const googleBallotReminder = createRequestBallotGoogle(req, region);

  res.render('get-mail-in-ballot-reminder', {
    ...region,
    markdown,
    googleBallotReminder
  });
});

router.get('/:state/:county/mail-in-ballot-reminder', async function(req, res, next) {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    console.error("Couldn't get region from ", req.params.state);
    return next();
  }

  const googleBallotReminder = createRequestBallotGoogle(req, region);

  res.render('get-mail-in-ballot-reminder', {
    ...region,
    markdown,
    googleBallotReminder
  });
});

router.get('/:state/:county', async function(req, res, next) {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    console.error("Couldn't get region from ", req.params.state);
    return next();
  }
  // console.log(region);
  res.render('location-rules', {
    ...region,
    markdown
  });
});

router.get('/:state', async function(req, res, next) {
  var region = null;
  try {
    region = await getRegion(req, req.params.state);
  }
  catch(err) {
    console.error("Couldn't get region from ", req.params.state);
    return next();
  }
  // console.log(region);
  if (region.counties) {
    res.render('state-counties-list', {
      ...region,
      markdown
    });
  } else {
    res.render('location-rules', {
      ...region,
      markdown
    });
  }
});

export default router;
