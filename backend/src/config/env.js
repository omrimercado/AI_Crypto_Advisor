const { cleanEnv, str, port, url, num } = require('envalid');

const validateEnv = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production'],
      default: 'development'
    }),
    PORT: port({ default: 5000 }),

    // Required in production
    MONGODB_URI: str({
      default: process.env.NODE_ENV === 'production' ? undefined : 'mongodb://localhost:27017/crypto-advisor',
      desc: 'MongoDB connection string'
    }),
    JWT_SECRET: str({
      default: process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-change-in-production',
      desc: 'JWT signing secret - REQUIRED in production'
    }),
    JWT_EXPIRES_IN: str({ default: '7d' }),

    // External APIs (optional with fallbacks)
    COINGECKO_API_URL: url({ default: 'https://api.coingecko.com/api/v3' }),
    CRYPTOPANIC_API_URL: url({ default: 'https://cryptopanic.com/api/developer/v2' }),
    CRYPTOPANIC_API_KEY: str({ default: '' }),
    AI_API_URL: url({ default: 'https://openrouter.ai/api/v1' }),
    AI_API_KEY: str({ default: '' }),
    AI_MODEL: str({ default: 'openai/gpt-oss-20b' }),

    // CORS
    CORS_ORIGIN: str({ default: 'http://localhost:3000' }),

    // Security
    BCRYPT_ROUNDS: num({ default: 12 }),
  });
};

module.exports = validateEnv;
