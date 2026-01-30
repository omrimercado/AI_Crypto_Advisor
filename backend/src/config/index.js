require('dotenv').config();
const validateEnv = require('./env');

// Validate environment variables - fails fast in production if required vars missing
const env = validateEnv();

module.exports = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  mongodb: {
    uri: env.MONGODB_URI
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'crypto-advisor-api',
    audience: 'crypto-advisor-client'
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    credentials: true
  },

  security: {
    bcryptRounds: env.BCRYPT_ROUNDS
  },

  external: {
    coingecko: {
      baseUrl: env.COINGECKO_API_URL,
      timeout: 10000
    },
    cryptopanic: {
      baseUrl: env.CRYPTOPANIC_API_URL,
      apiKey: env.CRYPTOPANIC_API_KEY,
      timeout: 10000
    },
    ai: {
      baseUrl: env.AI_API_URL,
      apiKey: env.AI_API_KEY,
      model: env.AI_MODEL,
      timeout: 60000
    }
  },

  cache: {
    prices: 120,      // 2 minutes in seconds
    news: 600,        // 10 minutes
    insight: 86400    // 24 hours
  }
};
