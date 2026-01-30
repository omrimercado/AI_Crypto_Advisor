const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { feedbackLimiter } = require('../middleware/rateLimiter.middleware');
const { feedbackValidator } = require('../validators/feedback.validator');
const feedbackService = require('../../core/services/feedback.service');

// POST /feedback
router.post('/', authMiddleware, feedbackLimiter, feedbackValidator, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { section, contentId, vote } = req.body;
    const result = await feedbackService.submitFeedback(userId, { section, contentId, vote });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /feedback (get user's feedback history)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await feedbackService.getUserFeedback(userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
