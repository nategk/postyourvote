import { Router } from 'express'
import { getRegion } from '../lib/utils.js'
import markdown from 'marked'
import { createRequestBallotGoogle } from './reminders.js'
import logger from '../lib/logger.js'

var router = Router();

router.get('/:state/:county', async function(req, res, next) {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    logger.error("Couldn't get region from %s, %s: %s", req.params.state, req.params.county, err);
    return next();
  }
  res.render('region', {
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
    logger.error("Couldn't get region from %s: %s", req.params.state, err);
    return next();
  }
  if (region.counties) {
    res.render('state-counties-list', {
      ...region,
      markdown
    });
  } else {
    res.render('region', {
      ...region,
      markdown
    });
  }
});

export default router;
