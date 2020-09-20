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

function createReturnBallotIcal(req, region) {
  const cal = ical({
    timezone: region.timezone,
    domain: req.get('host'),
    prodId: {company: req.app.get('config').product, product: req.app.get('config').product},
    name: req.app.get('config').product
  });
  cal.createEvent({
    start: moment(region.recommendedBallotReturnDate),
    end: moment(region.recommendedBallotReturnDate).add(1, 'day'),
    allDay: true,
    summary: "Last day to send back my ballot!",
    description: `${region.name} voters should have their ballots in hand, filled out, and today is the last day we recommend sending it back, either by taking it to  Ballot Drop Box, or a blue USPS mailbox. After today, you should make plans to vote in person and, if you do, don't forget to take your ballot with you.`,
  });
  return cal;
}

function createReturnBallotGoogle(req, region) {
  const createEventUrl = googleCalendarEventUrl({
    start: moment(region.recommendedBallotReturnDate).format('YYYYMMDD'),
    end: moment(region.recommendedBallotReturnDate).add(1, 'day').format('YYYYMMDD'),
    title: "Last day to send back my ballot!",
    details: `${region.name} voters should have their ballots in hand, filled out, and today is the last day we recommend sending it back, either by taking it to  Ballot Drop Box, or a blue USPS mailbox. After today, you should make plans to vote in person and, if you do, don't forget to take your ballot with you.`,
  });
  logger.debug("google calendar event url: %s", createEventUrl);
  return createEventUrl;
}

router.get('/:state/reminders/return-ballot.ics', async (req, res, next) => {
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
  const cal = createReturnBallotIcal(req, region);
  cal.serve(res);
});

router.get('/:state/:county/reminders/return-ballot.ics', async (req, res, next) => {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    logger.error("Couldn't get region from ", req.params.state);
    return next();
  }
  const cal = createReturnBallotIcal(req, region);
  cal.serve(res);
});

export { createReturnBallotGoogle };
export default router;
