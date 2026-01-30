const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const { createModuleLogger } = require('./logger');

const logger = createModuleLogger('http-client');

/**
 * Create an Axios instance with timeout, retry, and logging
 * @param {Object} options - Configuration options
 * @param {string} options.name - Name for logging
 * @param {string} options.baseURL - Base URL for requests
 * @param {number} options.timeout - Request timeout in ms (default: 10000)
 * @param {number} options.retries - Number of retries (default: 3)
 * @param {Object} options.headers - Additional headers
 */
const createHttpClient = ({ name, baseURL, timeout = 10000, retries = 3, headers = {} }) => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });

  // Configure retry with exponential backoff
  axiosRetry(client, {
    retries,
    retryDelay: (retryCount) => {
      const delay = axiosRetry.exponentialDelay(retryCount);
      logger.debug({ service: name, retryCount, delay }, 'Retrying request');
      return delay;
    },
    retryCondition: (error) => {
      // Retry on network errors and 5xx responses (for idempotent requests)
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response && error.response.status >= 500);
    },
    onRetry: (retryCount, error, requestConfig) => {
      logger.warn({
        service: name,
        retryCount,
        url: requestConfig.url,
        error: error.message
      }, 'Request retry');
    }
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: Date.now() };
      logger.debug({
        service: name,
        method: config.method?.toUpperCase(),
        url: config.url
      }, 'Outgoing request');
      return config;
    },
    (error) => {
      logger.error({ service: name, error: error.message }, 'Request error');
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
      logger.debug({
        service: name,
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`
      }, 'Response received');
      return response;
    },
    (error) => {
      const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
      logger.error({
        service: name,
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        duration: `${duration}ms`,
        error: error.message
      }, 'Response error');
      return Promise.reject(error);
    }
  );

  return client;
};

module.exports = { createHttpClient };
