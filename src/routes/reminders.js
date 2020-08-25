import { Router } from 'express'
import { getRegion } from '../lib/utils.js'
// import markdown from 'marked'
import ical from 'ical-generator'
import moment from 'moment'
import { googleCalendarEventUrl } from 'google-calendar-url'

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
  console.log(createEventUrl)
  return createEventUrl;
}

router.get('/:state/reminders/request-ballot.ics', async (req, res, next) => {
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
  const cal = createRequestBallotIcal(req, region);
  cal.serve(res);
});

router.get('/:state/:county/reminders/request-ballot.ics', async (req, res, next) => {
  var region = null;
  try {
    region = await getRegion(req, req.params.state, req.params.county);
  }
  catch(err) {
    console.error("Couldn't get region from ", req.params.state);
    return next();
  }
  const cal = createRequestBallotIcal(req, region);
  cal.serve(res);
});

// function generateBallotPostByDateReminderGoogle(region) {

// }

// export { generateBallotPostByDateReminderIcal, generateBallotPostByDateReminderGoogle }

export { createRequestBallotGoogle };
export default router;
