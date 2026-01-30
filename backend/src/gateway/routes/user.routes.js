const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { onboardingValidator } = require('../validators/user.validator');
const userService = require('../../core/services/user.service');

// POST /user/onboarding
router.post('/onboarding', authMiddleware, onboardingValidator, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    const result = await userService.updateOnboarding(userId, preferences);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /user/profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.getProfile(userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
