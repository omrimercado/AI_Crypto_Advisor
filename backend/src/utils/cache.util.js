const { pricesCache, newsCache, insightCache } = require('../config/cache');

// Clear all caches
const clearAllCaches = () => {
  pricesCache.flushAll();
  newsCache.flushAll();
  insightCache.flushAll();
};

// Get cache statistics
const getCacheStats = () => {
  return {
    prices: pricesCache.getStats(),
    news: newsCache.getStats(),
    insight: insightCache.getStats()
  };
};

// Clear specific cache
const clearCache = (cacheType) => {
  switch (cacheType) {
    case 'prices':
      pricesCache.flushAll();
      break;
    case 'news':
      newsCache.flushAll();
      break;
    case 'insight':
      insightCache.flushAll();
      break;
    default:
      throw new Error('Invalid cache type');
  }
};

module.exports = {
  clearAllCaches,
  getCacheStats,
  clearCache
};
