import express from 'express'
import { getRegion } from '../lib/utils.js'
// import markdown from 'marked'
import ical from 'ical-generator'
import moment from 'moment'
import googleCal from 'google-calendar-url'
import logger from '../lib/logger.js'

const { Router } = express;
const { googleCalendarEventUrl } = googleCal;

var router = Router();

function createRequestBallotIcal(req, region) {
  const cal = ical({
    timezone: region.timezone,
    domain: req.get('host'),
    prodId: {company: req.app.get('config').product, product: req.app.get('config').product},
    name: req.app.get('config').product
  });
  cal.createEvent({
    start: moment(region.ballotRequestDeadline),
    end: moment(region.ballotRequestDeadline).add(1, 'day'),
    allDay: true,
    summary: "Last day to send back my ballot!",
    description: `${region.name} voters should have their ballots postmarked by now.`,
  });
  return cal;
}

function createRequestBallotGoogle(req, region) {
  const createEventUrl = googleCalendarEventUrl({
    start: moment(region.ballotRequestDeadline).format('YYYYMMDD'),
    end: moment(region.ballotRequestDeadline).add(1, 'day').format('YYYYMMDD'),
    title: "Last day to send back my ballot!",
    details: `${region.name} voters should have their ballots postmarked by now.`,
  });
  logger.debug("google calendar event url: %s", createEventUrl);
  return createEventUrl;
}

router.get('/:state/reminders/request-ballot.ics', async (req, res, next) => {
  var region = null;
  try {
    region = await getRegion(req, req.params.state)
  }
  catch(err) {
    logger.error(err);
    return next();
  }
  if (region.counties) {
    return next();
  }
  const cal = createRequestBallotIcal(req, region);
  cal.serve(res);
});

router.get('/:state/:county/reminders/request-ballot.ics', async (req, res, next) => {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    logger.error("Couldn't get region from ", req.params.state);
    return next();
  }
  const cal = createRequestBallotIcal(req, region);
  cal.serve(res);
});

export { createRequestBallotGoogle };
export default router;
