const config = require('../../config');
const { newsCache } = require('../../config/cache');
const { createHttpClient } = require('../../config/http');
const { createModuleLogger } = require('../../config/logger');

const logger = createModuleLogger('cryptopanic-service');

// Map CoinGecko IDs to CryptoPanic currency symbols
const idToSymbolMap = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  'cardano': 'ADA',
  'polkadot': 'DOT',
  'dogecoin': 'DOGE',
  'ripple': 'XRP',
  'avalanche-2': 'AVAX',
  'matic-network': 'MATIC',
  'chainlink': 'LINK',
  'uniswap': 'UNI',
  'cosmos': 'ATOM',
  'litecoin': 'LTC',
  'shiba-inu': 'SHIB',
  'binancecoin': 'BNB'
};

// Create HTTP client with retry and timeout
const client = createHttpClient({
  name: 'cryptopanic',
  baseURL: config.external.cryptopanic.baseUrl,
  timeout: config.external.cryptopanic.timeout,
  retries: 2
});

const getNews = async (assets) => {
  const cacheKey = `news_${[...assets].sort().join('_')}`;

  // Check cache
  const cached = newsCache.get(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, 'Cache hit for news');
    return { ...cached, fromCache: true };
  }

  try {
    // If API key is not configured, use fallback
    if (!config.external.cryptopanic.apiKey) {
      logger.info('CryptoPanic API key not configured, using fallback');
      return getFallbackNews(true);
    }

    // Convert CoinGecko IDs to currency symbols
    const currencies = assets
      .map(asset => idToSymbolMap[asset.toLowerCase()] || asset.toUpperCase())
      .join(',');

    logger.debug({ assets, currencies }, 'Fetching news for currencies');

    const response = await client.get('/posts/', {
      params: {
        auth_token: config.external.cryptopanic.apiKey,
        currencies: currencies,
        filter: 'hot'  // 'hot' returns more data than 'important' with public:true
      }
    });

    // Guard against malformed or empty response
    if (!response.data?.results || !Array.isArray(response.data.results)) {
      logger.warn('Unexpected CryptoPanic response structure');
      return getFallbackNews(true);
    }

    // Use fallback if API returns empty results
    if (response.data.results.length === 0) {
      logger.info('CryptoPanic returned empty results, using fallback');
      return getFallbackNews(true);
    }

    const news = response.data.results.slice(0, 10).map((item, index) => {
      return {
        id: `news-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        description: item.description || '',
        publishedAt: item.published_at || new Date().toISOString(),
        kind: item.kind || 'news'
      };
    });

    const result = {
      news,
      fromCache: false,
      isFallback: false
    };

    // Cache the result
    newsCache.set(cacheKey, result);
    logger.info({ newsCount: news.length }, 'Fetched news from CryptoPanic');

    return result;
  } catch (error) {
    logger.error({ error: error.message }, 'CryptoPanic API error');
    return getFallbackNews(true);
  }
};

const getFallbackNews = (isFallback = false) => {
  return {
    news: [
      {
        id: 'fallback-1',
        title: 'Bitcoin continues to show strength amid market volatility',
        description: 'Bitcoin has maintained its position as the leading cryptocurrency, showing resilience during recent market fluctuations. Analysts suggest institutional adoption continues to drive long-term value.',
        publishedAt: new Date().toISOString(),
        kind: 'news'
      },
      {
        id: 'fallback-2',
        title: 'Ethereum ecosystem sees growing DeFi adoption',
        description: 'The Ethereum network continues to dominate decentralized finance with increasing total value locked across major protocols. Layer 2 solutions are helping address scalability concerns.',
        publishedAt: new Date().toISOString(),
        kind: 'news'
      },
      {
        id: 'fallback-3',
        title: 'Institutional investors show renewed interest in crypto',
        description: 'Major financial institutions are expanding their cryptocurrency offerings as regulatory clarity improves. Several banks have announced plans to offer crypto custody services.',
        publishedAt: new Date().toISOString(),
        kind: 'news'
      },
      {
        id: 'fallback-4',
        title: 'Layer 2 solutions gaining traction for scalability',
        description: 'Rollup technologies and sidechains are seeing increased adoption as users seek lower transaction fees. Projects like Arbitrum and Optimism report record transaction volumes.',
        publishedAt: new Date().toISOString(),
        kind: 'news'
      },
      {
        id: 'fallback-5',
        title: 'NFT market shows signs of maturation',
        description: 'The NFT space is evolving beyond digital art into utility-focused applications. Gaming, ticketing, and identity verification use cases are driving new adoption.',
        publishedAt: new Date().toISOString(),
        kind: 'news'
      }
    ],
    fromCache: false,
    isFallback,
    error: isFallback ? 'News data temporarily unavailable' : undefined
  };
};

module.exports = {
  getNews
};
