# AI Crypto Advisor

A personalized cryptocurrency dashboard application that provides real-time prices, news, AI-powered insights, and crypto memes based on user preferences.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [External Services](#external-services)
- [Caching Strategy](#caching-strategy)
- [Security](#security)

## Overview

AI Crypto Advisor is a full-stack web application that delivers a personalized crypto experience. Users complete an onboarding flow to select their preferred cryptocurrencies, investor type (HODLer, Day Trader, or NFT Collector), and content preferences. The dashboard then displays tailored content including live prices, relevant news, AI-generated insights, and crypto memes.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Login   │  │ Register │  │Onboarding│  │Dashboard │  │Components│     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘     │
│       └─────────────┴─────────────┴─────────────┘                          │
│                              │ API Client (Axios)                          │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API GATEWAY LAYER                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │Rate Limiter │  │    Auth     │  │  Validator  │                  │   │
│  │  │ Middleware  │  │ Middleware  │  │ Middleware  │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                        ROUTES                                │    │   │
│  │  │  /auth  │  /user  │  /dashboard  │  /feedback  │  /health   │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CORE SERVICES                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │    Auth     │  │    User     │  │  Dashboard  │  │ Feedback  │  │   │
│  │  │  Service    │  │  Service    │  │   Service   │  │  Service  │  │   │
│  │  └─────────────┘  └─────────────┘  └──────┬──────┘  └───────────┘  │   │
│  └───────────────────────────────────────────┼──────────────────────────┘   │
│                                              │                              │
│  ┌───────────────────────────────────────────┼──────────────────────────┐   │
│  │                      EXTERNAL SERVICES                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │  CoinGecko  │  │ CryptoPanic │  │     AI      │  │   Meme    │  │   │
│  │  │  Service    │  │   Service   │  │   Service   │  │  Service  │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │   │
│  └─────────┼────────────────┼────────────────┼───────────────┼─────────┘   │
│            │                │                │               │              │
│  ┌─────────┴────────────────┴────────────────┴───────────────┴─────────┐   │
│  │                          CACHE LAYER (NodeCache)                     │   │
│  │     pricesCache (2min)  │  newsCache (10min)  │  insightCache (24h)  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB     │    │  CoinGecko API  │    │  CryptoPanic    │
│  (Database)   │    │  (Prices)       │    │  (News)         │
└───────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  OpenRouter AI  │
                     │  (Insights)     │
                     └─────────────────┘
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **NodeCache** - In-memory caching
- **Pino** - Logging
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **Joi** - Request validation

## Project Structure

```
AI_Crypto_Advisor/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app entry point
│   │   ├── config/
│   │   │   ├── index.js           # Main configuration
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── cache.js           # Cache instances
│   │   │   ├── env.js             # Environment validation
│   │   │   ├── http.js            # HTTP client factory
│   │   │   └── logger.js          # Pino logger setup
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── user.model.js  # User schema
│   │   │   │   └── feedback.model.js
│   │   │   ├── services/
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── user.service.js
│   │   │   │   ├── dashboard.service.js
│   │   │   │   └── feedback.service.js
│   │   │   └── external/
│   │   │       ├── coingecko.service.js   # Price data
│   │   │       ├── cryptopanic.service.js # News data
│   │   │       ├── ai.service.js          # AI insights
│   │   │       └── meme.service.js        # Crypto memes
│   │   ├── gateway/
│   │   │   ├── routes/
│   │   │   │   ├── index.js       # Route aggregator
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── user.routes.js
│   │   │   │   ├── dashboard.routes.js
│   │   │   │   └── feedback.routes.js
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── errorHandler.middleware.js
│   │   │   │   └── rateLimiter.middleware.js
│   │   │   └── validators/
│   │   │       ├── auth.validator.js
│   │   │       ├── user.validator.js
│   │   │       └── feedback.validator.js
│   │   └── utils/
│   │       ├── cache.util.js
│   │       └── helpers.js
│   ├── data/
│   │   └── memes.json             # Crypto memes collection
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   ├── App.tsx                # Root component with routing
│   │   ├── api/
│   │   │   ├── client.ts          # Axios instance
│   │   │   ├── auth.ts            # Auth API calls
│   │   │   ├── user.ts            # User API calls
│   │   │   └── dashboard.ts       # Dashboard API calls
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PricesSection.tsx
│   │   │   ├── NewsSection.tsx
│   │   │   ├── AiInsightSection.tsx
│   │   │   ├── MemeSection.tsx
│   │   │   └── VoteButtons.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   └── Dashboard.tsx
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Features

### User Authentication
- Email/password registration and login
- JWT-based authentication with secure httpOnly considerations
- Protected routes requiring authentication

### Onboarding Flow
- **Step 1**: Select cryptocurrency assets (BTC, ETH, SOL, etc.)
- **Step 2**: Choose investor type (HODLer, Day Trader, NFT Collector)
- **Step 3**: Select content preferences (News, Charts, Social, Memes)

### Personalized Dashboard
- **Live Prices**: Real-time cryptocurrency prices from CoinGecko
- **News Feed**: Relevant crypto news from CryptoPanic
- **AI Insights**: Daily personalized insights based on user profile
- **Crypto Memes**: Fun crypto-related memes

### Feedback System
- Vote on AI insights (helpful/not helpful)
- Used to improve recommendation quality

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crypto-advisor
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173

# External APIs (optional - fallbacks available)
COINGECKO_API_URL=https://api.coingecko.com/api/v3
CRYPTOPANIC_API_KEY=your-cryptopanic-key
AI_API_URL=https://openrouter.ai/api/v1
AI_API_KEY=your-openrouter-key
AI_MODEL=openai/gpt-4o-mini
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure API URL in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/me` | Get current user |
| POST | `/api/user/onboarding` | Save onboarding preferences |
| PUT | `/api/user/preferences` | Update preferences |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get personalized dashboard data |

### Feedback Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit feedback on insights |

### Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Basic health check |
| GET | `/api/health/ready` | Detailed readiness check |

## External Services

### CoinGecko API
- **Purpose**: Fetch real-time cryptocurrency prices
- **Features**: Price, 24h change, market cap, volume
- **Rate Limit**: Free tier available
- **Fallback**: Returns empty price data with error flag

### CryptoPanic API
- **Purpose**: Fetch crypto news and updates
- **Features**: Filtered by currencies, sorted by relevance
- **Rate Limit**: Free tier with API key
- **Fallback**: Returns curated fallback news articles

### OpenRouter AI
- **Purpose**: Generate personalized daily insights
- **Features**: Context-aware based on user preferences
- **Rate Limit**: Pay-per-use
- **Fallback**: Returns pre-written insights by investor type

### Meme Service
- **Purpose**: Serve crypto-related memes
- **Features**: Random selection from curated collection
- **Source**: Local JSON file with meme URLs

## Caching Strategy

The application uses NodeCache for in-memory caching to reduce API calls and improve response times:

| Cache | TTL | Purpose |
|-------|-----|---------|
| `pricesCache` | 2 minutes | Cryptocurrency price data |
| `newsCache` | 10 minutes | News articles |
| `insightCache` | 24 hours | AI-generated insights (per user) |

Cache keys are generated based on requested assets to ensure data freshness while minimizing external API calls.

## Security

### Implemented Security Measures

- **Helmet.js**: Security headers (XSS, clickjacking, etc.)
- **CORS**: Configured allowlist for origins
- **Rate Limiting**: Global and per-route limits
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Joi schema validation
- **Request Size Limits**: 10KB body limit
- **Graceful Shutdown**: Proper connection cleanup

### Environment Variables

All sensitive configuration is stored in environment variables. Never commit `.env` files to version control.

## License

MIT

## Author

Omri Mercado
