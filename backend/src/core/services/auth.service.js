const jwt = require('jsonwebtoken');
const config = require('../../config');
const { User } = require('../models');
const { createModuleLogger } = require('../../config/logger');

const logger = createModuleLogger('auth-service');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      tokenVersion: user.tokenVersion || 0 // For future token invalidation
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience
  });
};

const register = async ({ email, name, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    logger.warn({ email }, 'Registration attempt with existing email');
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  // Create new user
  const user = new User({
    email: email.toLowerCase(),
    name,
    password
  });
  await user.save();

  logger.info({ userId: user._id, email: user.email }, 'New user registered');

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: user.toJSON()
  };
};

const login = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    logger.warn({ email }, 'Login attempt with non-existent email');
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn({ userId: user._id }, 'Login attempt with invalid password');
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  logger.info({ userId: user._id }, 'User logged in');

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: user.toJSON()
  };
};

module.exports = {
  generateToken,
  verifyToken,
  register,
  login
};
