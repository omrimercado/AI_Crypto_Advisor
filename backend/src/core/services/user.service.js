const { User } = require('../models');

const updateOnboarding = async (userId, preferences) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.preferences = {
    assets: preferences.assets,
    investorType: preferences.investorType,
    contentTypes: preferences.contentTypes
  };
  user.onboardingCompleted = true;

  await user.save();

  return user.toJSON();
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

module.exports = {
  updateOnboarding,
  getProfile
};
