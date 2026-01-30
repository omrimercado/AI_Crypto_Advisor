const config = require('../../config');
const { pricesCache } = require('../../config/cache');
const { createHttpClient } = require('../../config/http');
const { createModuleLogger } = require('../../config/logger');

const logger = createModuleLogger('coingecko-service');

// Create HTTP client with retry and timeout
const client = createHttpClient({
  name: 'coingecko',
  baseURL: config.external.coingecko.baseUrl,
  timeout: config.external.coingecko.timeout,
  retries: 3
});

// Map common asset symbols to CoinGecko IDs
const assetIdMap = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'DOGE': 'dogecoin',
  'XRP': 'ripple',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'SHIB': 'shiba-inu',
  'BNB': 'binancecoin'
};

// Valid CoinGecko IDs for validation
const validCoinIds = new Set(Object.values(assetIdMap));

const getPrices = async (assets) => {
  const cacheKey = `prices_${[...assets].sort().join('_')}`;

  // Check cache
  const cached = pricesCache.get(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, 'Cache hit for prices');
    return { ...cached, fromCache: true };
  }

  try {
    // Convert asset symbols to CoinGecko IDs and track invalid ones
    const assetMapping = assets.map(asset => {
      const id = assetIdMap[asset.toUpperCase()] || asset.toLowerCase();
      const isValid = validCoinIds.has(id) || validCoinIds.has(asset.toLowerCase());
      return { original: asset, id, isValid };
    });

    const validAssets = assetMapping.filter(a => a.isValid);
    const invalidAssets = assetMapping.filter(a => !a.isValid);

    if (invalidAssets.length > 0) {
      logger.warn({ invalidAssets: invalidAssets.map(a => a.original) }, 'Unknown assets requested');
    }

    const coinIds = validAssets.map(a => a.id).join(',');

    if (!coinIds) {
      logger.warn('No valid coin IDs to fetch');
      return getFallbackPrices(assets, true);
    }

    const response = await client.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: coinIds,
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });

    const prices = response.data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h
    }));

    // Add fallback entries for invalid assets
    const invalidPrices = invalidAssets.map(a => ({
      id: a.original.toLowerCase(),
      symbol: a.original.toUpperCase(),
      name: a.original,
      image: null,
      currentPrice: null,
      priceChange24h: null,
      unsupported: true
    }));

    const result = {
      prices: [...prices, ...invalidPrices],
      fromCache: false,
      hasUnsupported: invalidAssets.length > 0
    };

    // Cache the result
    pricesCache.set(cacheKey, result);
    logger.info({ assetCount: prices.length }, 'Fetched prices from CoinGecko');

    return result;
  } catch (error) {
    logger.error({ error: error.message }, 'CoinGecko API error');
    return getFallbackPrices(assets, true);
  }
};

const getFallbackPrices = (assets, isFallback = false) => {
  return {
    prices: assets.map(asset => ({
      id: asset.toLowerCase(),
      symbol: asset.toUpperCase(),
      name: asset,
      image: null,
      currentPrice: null,
      priceChange24h: null,
      marketCap: null,
      volume24h: null,
      high24h: null,
      low24h: null
    })),
    fromCache: false,
    isFallback,
    error: isFallback ? 'Price data temporarily unavailable' : undefined
  };
};

module.exports = {
  getPrices
};
