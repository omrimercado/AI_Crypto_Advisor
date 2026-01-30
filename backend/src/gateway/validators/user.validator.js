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

const onboardingValidator = [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('preferences.assets')
    .isArray({ min: 1 })
    .withMessage('Please select at least one crypto asset'),
  body('preferences.assets.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Asset name must be a non-empty string'),
  body('preferences.investorType')
    .isIn(['hodler', 'dayTrader', 'nftCollector'])
    .withMessage('Invalid investor type'),
  body('preferences.contentTypes')
    .isArray({ min: 1 })
    .withMessage('Please select at least one content type'),
  body('preferences.contentTypes.*')
    .isIn(['news', 'charts', 'social', 'fun'])
    .withMessage('Invalid content type'),
  handleValidationErrors
];

module.exports = {
  onboardingValidator
};
