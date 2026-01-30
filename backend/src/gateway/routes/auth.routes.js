const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const authService = require('../../core/services/auth.service');

// POST /auth/register
router.post('/register', authLimiter, registerValidator, async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const result = await authService.register({ email, name, password });
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', authLimiter, loginValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
