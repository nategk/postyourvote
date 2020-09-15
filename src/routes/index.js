import express from 'express'
import getIpLocation from '../lib/iplocation.js'
import { getRegion } from '../lib/utils.js'
import { getPostalcode } from '../lib/placesearch.js'
import logger from '../lib/logger.js';

// Sub section routers
import adminRouter from './admin.js'
import chooseLocationRouter from './chooselocation.js'
import regionInfoRouter from './region-info.js'
import remindersRouter from './reminders.js'

const { Router } = express;
var router = Router();

router.use(regionInfoRouter);
router.use(remindersRouter);
router.use(chooseLocationRouter);
router.use('/admin', adminRouter);

router.get('/', async function(req, res) {
  let location = await getIpLocation(req);
  // DEBUG OVERRIDE
  // location = {status: 'success', zip: '33418'};
  if (location.status == "success" && !location.mobile) {
    let postalResults = await getPostalcode(req.app.get('db'), parseInt(location.zip));
    if (postalResults.status == 'success' && postalResults.data.length == 1) {
      var region = null;
      try {
        region = await getRegion(req, postalResults.data[0].state, postalResults.data[0].county);
      }
      catch(err) {
        logger.error("Couldn't get region from %s: %s", req.params.state, err);
      }
      if (region && !region.counties) {
        res.render('home', {
          located: true,
          ...region,
        });
        return;
      }
    }
  }
  // If we get this far, we haven't found a suitable location
  res.locals.path = req.path;
  res.render('home', { title: 'Post Your Vote', located: false });
});

router.get('/about', function(req, res) {
  res.locals.path = req.path;
  res.render('about', { title: 'About this project' });
});

router.get('/data', function(req, res) {
  res.locals.path = req.path;
  res.render('data', { title: 'Check our work' });
});

router.get('/faq', function(req, res) {
  res.locals.path = req.path;
  res.render('faq', { title: 'Frequently Asked Questions' });
});

router.get('/share', function(req, res) {
  res.locals.path = req.path;
  res.render('share', { title: 'Share' });
});

router.get('/get-mail-in-ballot-status', function(req, res) {
  res.locals.path = req.path;
  res.render('get-mail-in-ballot-status', { title: 'Mail-in ballot status' });
});

router.get('/get-voter-registration-status', function(req, res) {
  res.locals.path = req.path;
  res.render('get-voter-registration-status', { title: 'Voter registration status' });
});

export default router;
