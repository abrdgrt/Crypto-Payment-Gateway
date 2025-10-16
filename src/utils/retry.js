// utils/retry.js

/**
 * Retries a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.retries - Maximum number of retries
 * @param {number} options.factor - Exponential factor for backoff
 * @param {number} options.minTimeout - Minimum timeout between retries in milliseconds
 * @param {number} options.maxTimeout - Maximum timeout between retries in milliseconds
 * @returns {Promise} - Promise that resolves with the result of the function or rejects after all retries
 */
const retry = async (fn, options = {}) => {
    const {
      retries = 3,
      factor = 2,
      minTimeout = 1000,
      maxTimeout = 60000,
    } = options;
  
    let attempt = 0;
    
    const executeWithRetry = async () => {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw error;
        }
        
        const timeout = Math.min(
          Math.max(minTimeout * Math.pow(factor, attempt), minTimeout),
          maxTimeout
        );
        
        await new Promise(resolve => setTimeout(resolve, timeout));
        return executeWithRetry();
      }
    };
  
    return executeWithRetry();
  };
  
  module.exports = { retry };