// Async handler wrapper to avoid try-catch in every route
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create custom error with status code
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Format response helper
const formatResponse = (success, data = null, message = null) => {
  const response = { success };
  if (data) response.data = data;
  if (message) response.message = message;
  return response;
};

module.exports = {
  asyncHandler,
  createError,
  formatResponse
};
