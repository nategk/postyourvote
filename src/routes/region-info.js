import express from 'express'
import { getRegion } from '../lib/utils.js'
import { marked } from 'marked'
import moment from 'moment';
import { createReturnBallotGoogle } from './reminders.js'
import logger from '../lib/logger.js'

const { Router } = express;
var router = Router();

router.get('/:state/:county', regionInfo);
router.get('/:state', regionInfo);

async function regionInfo(req, res, next) {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    logger.error("Couldn't get region from %s: %s", req.params, err);
    return next();
  }
  logger.info("Region: %s", region);
  logger.info("methods: %s", region.ballotRequestMethod);
  let data = {...region, markdown, moment};
  data.returnBallotGoogleEventUrl = createReturnBallotGoogle(req, region);
  if (region.counties) {
    res.locals.path = req.path;
    res.render('state-counties-list', data);
  } else {
    res.locals.path = req.path;
    res.render('region', data);
  }
}

export default router;
