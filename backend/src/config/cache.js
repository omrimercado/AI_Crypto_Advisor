const NodeCache = require('node-cache');
const config = require('./index');

// Create cache instances with different TTLs
const pricesCache = new NodeCache({ stdTTL: config.cache.prices, checkperiod: 60 });
const newsCache = new NodeCache({ stdTTL: config.cache.news, checkperiod: 120 });
const insightCache = new NodeCache({ stdTTL: config.cache.insight, checkperiod: 3600 });

module.exports = {
  pricesCache,
  newsCache,
  insightCache
};
