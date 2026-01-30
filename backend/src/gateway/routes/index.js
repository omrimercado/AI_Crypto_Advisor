const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { pricesCache, newsCache, insightCache } = require('../../config/cache');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');
const feedbackRoutes = require('./feedback.routes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/feedback', feedbackRoutes);

// Health check endpoint - basic liveness probe
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe - checks dependencies
router.get('/health/ready', async (req, res) => {
  const checks = {
    database: {
      status: 'unknown',
      latency: null
    },
    cache: {
      prices: { keys: 0 },
      news: { keys: 0 },
      insight: { keys: 0 }
    }
  };

  // Check MongoDB connection
  const dbStart = Date.now();
  try {
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    checks.database.status = stateMap[state] || 'unknown';
    checks.database.latency = `${Date.now() - dbStart}ms`;

    // Ping the database if connected
    if (state === 1) {
      await mongoose.connection.db.admin().ping();
      checks.database.latency = `${Date.now() - dbStart}ms`;
    }
  } catch (error) {
    checks.database.status = 'error';
    checks.database.error = error.message;
  }

  // Check cache stats
  try {
    checks.cache.prices.keys = pricesCache.keys().length;
    checks.cache.news.keys = newsCache.keys().length;
    checks.cache.insight.keys = insightCache.keys().length;
  } catch (error) {
    checks.cache.error = error.message;
  }

  // Determine overall health
  const isHealthy = checks.database.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    checks,
    uptime: `${Math.floor(process.uptime())}s`,
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    }
  });
});

module.exports = router;
