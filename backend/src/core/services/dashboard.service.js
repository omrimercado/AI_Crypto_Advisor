const { User } = require('../models');
const coingeckoService = require('../external/coingecko.service');
const cryptopanicService = require('../external/cryptopanic.service');
const aiService = require('../external/ai.service');
const memeService = require('../external/meme.service');
const { createModuleLogger } = require('../../config/logger');

const logger = createModuleLogger('dashboard-service');

const getDashboard = async (userId) => {
  // Get user preferences
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.onboardingCompleted) {
    const error = new Error('Please complete onboarding first');
    error.statusCode = 400;
    throw error;
  }

  const { preferences } = user;

  logger.info({ userId, assets: preferences.assets }, 'Fetching dashboard data');

  // Fetch all data in parallel
  const [pricesResult, newsResult, insight, meme] = await Promise.all([
    coingeckoService.getPrices(preferences.assets),
    cryptopanicService.getNews(preferences.assets),
    aiService.getInsight(userId, preferences),
    memeService.getRandomMeme()
  ]);

  // Build metadata about data sources
  const metadata = {
    prices: {
      fromCache: pricesResult.fromCache || false,
      isFallback: pricesResult.isFallback || false,
      count: pricesResult.prices?.length || 0
    },
    news: {
      fromCache: newsResult.fromCache || false,
      isFallback: newsResult.isFallback || false,
      count: newsResult.news?.length || 0
    },
    insight: {
      isFallback: insight.isFallback || false
    }
  };

  logger.debug({ userId, metadata }, 'Dashboard data fetched');

  return {
    prices: pricesResult.prices || [],
    news: newsResult.news || [],
    insight,
    meme,
    user: {
      name: user.name,
      preferences: user.preferences
    },
    _metadata: metadata // Include metadata for client debugging
  };
};

module.exports = {
  getDashboard
};
