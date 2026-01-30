const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const feedbackValidator = [
  body('section')
    .isIn(['news', 'prices', 'insight', 'meme'])
    .withMessage('Invalid section. Must be: news, prices, insight, or meme'),
  body('contentId')
    .trim()
    .notEmpty()
    .withMessage('Content ID is required'),
  body('vote')
    .isIn(['up', 'down'])
    .withMessage('Vote must be either "up" or "down"'),
  handleValidationErrors
];

module.exports = {
  feedbackValidator
};
