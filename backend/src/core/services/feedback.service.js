const { Feedback } = require('../models');

const submitFeedback = async (userId, { section, contentId, vote }) => {
  // Upsert - update if exists, create if not
  const feedback = await Feedback.findOneAndUpdate(
    { userId, section, contentId },
    { userId, section, contentId, vote },
    { upsert: true, new: true, runValidators: true }
  );

  return feedback;
};

const getUserFeedback = async (userId) => {
  const feedback = await Feedback.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100);

  return feedback;
};

module.exports = {
  submitFeedback,
  getUserFeedback
};
