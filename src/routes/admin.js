import airtableDataloader from '../lib/airtableDataloader.js'
import express from 'express'
import logger from '../lib/logger.js'

const { Router } = express;

var router = Router();

router.get('/clear-cache', (req, res) => {
  let cache = req.app.get('cache');
  cache.flush();
  const stats = cache.stats();
  res.json(stats);
});

router.get('/refresh-cache', async (req, res) => {
  let cache = req.app.get('cache');
  const airtable = req.app.get('airtable');
  const allStates = await airtableDataloader(airtable);
  for (const state of allStates) {
    logger.info("Setting state %s", state.stateKey);
    cache.set(state.stateKey, state);
  }
  const stats = cache.stats();
  res.json(stats);
});

router.get('/cache-stats', (req, res) => {
  let cache = req.app.get('cache');
  const stats = cache.stats();
  res.json(stats);
});

router.get('/all-data', async (req, res) => {
  const airtable = req.app.get('airtable');
  const data = await airtableDataloader(airtable);
  res.json(data);
});

router.get('/cache/:key', async (req, res) => {
  let cache = req.app.get('cache');
  try {
    const value = await cache.get(req.params.key);
    res.json(value);
  } catch (error) {
    res.status(404).json({status: 'error', message: error});
  }
});

export default router;
