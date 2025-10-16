// utils/memoize.js

/**
 * Memoizes a function to cache its results
 * @param {Function} fn - The function to memoize
 * @param {number} ttl - Time to live for cached results in milliseconds
 * @returns {Function} - Memoized function
 */
const memoize = (fn, ttl = Infinity) => {
    const cache = new Map();
  
    return (...args) => {
      const key = JSON.stringify(args);
      const cachedItem = cache.get(key);
  
      if (cachedItem && Date.now() - cachedItem.timestamp < ttl) {
        return cachedItem.value;
      }
  
      const result = fn(...args);
      cache.set(key, { value: result, timestamp: Date.now() });
  
      // Clean up expired items
      for (const [key, item] of cache.entries()) {
        if (Date.now() - item.timestamp >= ttl) {
          cache.delete(key);
        }
      }
  
      return result;
    };
  };
  
  module.exports = { memoize };