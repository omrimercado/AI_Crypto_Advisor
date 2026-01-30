const axios = require('axios');
const config = require('../../config');
const { insightCache } = require('../../config/cache');

const getInsight = async (userId, preferences) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `insight_${userId}_${today}`;

  // Check cache - one insight per user per day
  const cached = insightCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // If API key is not configured, use fallback
    if (!config.external.ai.apiKey) {
      const fallback = getFallbackInsight(preferences);
      insightCache.set(cacheKey, fallback);
      return fallback;
    }

    const prompt = generatePrompt(preferences);

    const response = await axios.post(
      `${config.external.ai.baseUrl}/chat/completions`,
      {
        model: config.external.ai.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${config.external.ai.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60s timeout for inference
      }
    );

    const message = response.data.choices[0].message;
    const content = message.content || message.reasoning || '';

    const insight = {
      id: `insight_${today}`,
      content: content,
      generatedAt: new Date().toISOString(),
      investorType: preferences.investorType,
      assets: preferences.assets
    };

    // Cache the result
    insightCache.set(cacheKey, insight);

    return insight;
  } catch (error) {
    console.error('AI Service error:', error.message);
    const fallback = getFallbackInsight(preferences);
    insightCache.set(cacheKey, fallback);
    return fallback;
  }
};

const generatePrompt = (preferences) => {
  const { assets, investorType, contentTypes } = preferences;

  const investorLabels = {
    hodler: 'HODLer',
    dayTrader: 'Day Trader',
    nftCollector: 'NFT Collector'
  };

  const assetNames = assets.map(asset => {
    const mapping = {
      bitcoin: 'Bitcoin (BTC)',
      ethereum: 'Ethereum (ETH)',
      solana: 'Solana (SOL)',
      cardano: 'Cardano (ADA)',
      polkadot: 'Polkadot (DOT)',
      avalanche: 'Avalanche (AVAX)',
      chainlink: 'Chainlink (LINK)',
      polygon: 'Polygon (MATIC)'
    };
    return mapping[asset.toLowerCase()] || asset;
  });

  return `You are a professional crypto market analyst.

Generate a short "Crypto Insight of the Day" for a personalized investor dashboard.

User profile:
- Investor type: ${investorLabels[investorType] || 'Crypto Investor'}
- Interested assets: ${assetNames.join(', ')}
- Content preferences: ${contentTypes.join(', ')}

Rules:
- Do NOT claim recent price movements unless explicitly provided.
- Focus on long-term fundamentals, general trends, or educational insights.
- Avoid phrases like "today", "this week", or "recently" unless market data is given.
- No predictions or guarantees.

Style:
- 3–5 sentences
- Neutral, educational tone
- One paragraph
- No emojis, no disclaimers

Generate the insight now.`;
};

const getFallbackInsight = (preferences) => {
  const insights = {
    hodler: [
      "Focus on dollar-cost averaging during market dips. Historical data shows consistent accumulation during downturns often leads to strong returns over 3-5 year periods.",
      "Consider rebalancing your portfolio quarterly. As your top holdings grow, ensure you're not overexposed to any single asset.",
      "Stack sats and stay patient. The best long-term returns come from holding through volatility, not timing the market."
    ],
    dayTrader: [
      "Watch for breakout patterns on 4-hour charts. Volume confirmation above key resistance levels often signals strong momentum plays.",
      "Set strict stop-losses at 2-3% below entry. Capital preservation is key for consistent day trading success.",
      "Monitor funding rates on perpetual futures. Extreme positive rates often precede short-term pullbacks."
    ],
    nftCollector: [
      "Track floor price trends and holder distribution. Collections with growing unique holders often signal organic demand.",
      "Look for projects with active communities and roadmap updates. Utility beyond speculation drives long-term value.",
      "Diversify across blue-chip and emerging collections. Established projects provide stability while new ones offer growth potential."
    ]
  };

  const typeInsights = insights[preferences.investorType] || insights.hodler;
  const randomInsight = typeInsights[Math.floor(Math.random() * typeInsights.length)];

  return {
    id: `insight_${new Date().toISOString().split('T')[0]}`,
    content: randomInsight,
    generatedAt: new Date().toISOString(),
    investorType: preferences.investorType,
    assets: preferences.assets,
    isFallback: true
  };
};

module.exports = {
  getInsight
};
