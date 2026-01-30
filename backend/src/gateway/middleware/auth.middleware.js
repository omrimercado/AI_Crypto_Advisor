const { verifyToken } = require('../../core/services/auth.service');
const { createModuleLogger } = require('../../config/logger');

const logger = createModuleLogger('auth-middleware');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    // Differentiate token errors for better debugging
    let message = 'Invalid or expired token.';

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please login again.';
      logger.debug({ error: error.message }, 'Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format.';
      logger.warn({ error: error.message }, 'Invalid token');
    } else {
      logger.error({ error: error.message }, 'Token verification error');
    }

    return res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = authMiddleware;
