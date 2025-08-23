/**
 * Debug module shim for browser compatibility
 * Provides fallback implementation for debug package
 */

const debug = (namespace) => {
  const logger = (...args) => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.debug(`[${namespace}]`, ...args);
    }
  };
  
  logger.enabled = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';
  
  return logger;
};

debug.enabled = (namespace) => {
  return typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';
};

debug.disable = () => {
  // No-op in browser
};

debug.enable = (pattern) => {
  if (typeof console !== 'undefined') {
    console.debug(`Debug enabled for: ${pattern}`);
  }
};

// Export both named and default exports for compatibility
export { debug };
export default debug;