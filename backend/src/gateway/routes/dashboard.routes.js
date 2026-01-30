const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { dashboardLimiter } = require('../middleware/rateLimiter.middleware');
const dashboardService = require('../../core/services/dashboard.service');

// GET /dashboard
router.get('/', authMiddleware, dashboardLimiter, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await dashboardService.getDashboard(userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
