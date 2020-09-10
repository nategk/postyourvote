import express from 'express'
import logger from '../lib/logger.js'

const { Router } = express;

var router = Router();

router.get('/clear-cache', (req, res) => {
  let cache = req.app.get('cache');
  let beforeStats = cache.stats();
  cache.flush();
  let stats = cache.stats();
  logger.info("Cleared cache. Before stats: %O", beforeStats);
  res.json(stats);
});

router.get('/cache-stats', (req, res) => {
  let cache = req.app.get('cache');
  let stats = cache.stats();
  res.json(stats);
});

export default router;
