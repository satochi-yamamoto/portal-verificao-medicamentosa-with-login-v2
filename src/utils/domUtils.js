/**
 * DOM utilities for performance optimization and preventing forced reflows
 */

/**
 * Batch DOM operations to prevent forced reflows
 * @param {Function} operations - Function containing DOM operations
 * @returns {Promise} - Promise that resolves after operations
 */
export const batchDOMOperations = (operations) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const start = performance.now();
      
      try {
        operations();
        
        const duration = performance.now() - start;
        if (duration > 16) {
          console.warn(`⚠️ DOM operations took ${duration.toFixed(2)}ms - consider optimization`);
        }
        
        resolve();
      } catch (error) {
        console.error('Error in DOM operations:', error);
        resolve();
      }
    });
  });
};

/**
 * Measure DOM operation performance
 * @param {string} operationName - Name of the operation
 * @param {Function} operation - Operation to measure
 * @returns {any} - Result of the operation
 */
export const measureDOMOperation = (operationName, operation) => {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  
  if (duration > 16) {
    console.warn(`🐌 ${operationName} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};

/**
 * Throttle resize events to prevent excessive reflows
 * @param {Function} callback - Callback to execute
 * @param {number} delay - Throttle delay in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttleResize = (callback, delay = 100) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      callback.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

/**
 * Optimize element creation and insertion
 * @param {string} tagName - Tag name
 * @param {object} attributes - Element attributes
 * @param {string} textContent - Text content
 * @param {Element} parent - Parent element
 * @returns {Element} - Created element
 */
export const createOptimizedElement = (tagName, attributes = {}, textContent = '', parent = null) => {
  const fragment = document.createDocumentFragment();
  const element = document.createElement(tagName);
  
  // Set attributes efficiently
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  fragment.appendChild(element);
  
  if (parent) {
    parent.appendChild(fragment);
  }
  
  return element;
};

/**
 * Virtual scrolling utilities to handle large lists
 * @param {Array} items - List items
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of container
 * @param {number} scrollTop - Current scroll position
 * @returns {object} - Virtual scroll data
 */
export const calculateVirtualScroll = (items, itemHeight, containerHeight, scrollTop) => {
  const totalHeight = items.length * itemHeight;
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    offsetY,
    totalHeight
  };
};

/**
 * Debounced style updates to prevent layout thrashing
 * @param {Element} element - Element to update
 * @param {object} styles - Styles to apply
 * @param {number} delay - Debounce delay
 */
export const debouncedStyleUpdate = (() => {
  const updates = new Map();
  
  return (element, styles, delay = 16) => {
    const elementKey = element;
    
    if (updates.has(elementKey)) {
      clearTimeout(updates.get(elementKey).timeoutId);
    }
    
    const existingStyles = updates.get(elementKey)?.styles || {};
    const mergedStyles = { ...existingStyles, ...styles };
    
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        Object.assign(element.style, mergedStyles);
        updates.delete(elementKey);
      });
    }, delay);
    
    updates.set(elementKey, { styles: mergedStyles, timeoutId });
  };
})();

/**
 * Monitor layout shifts and forced reflows
 */
export class LayoutShiftMonitor {
  constructor() {
    this.observer = null;
    this.threshold = 0.1; // 10ms threshold for warnings
  }
  
  start() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && entry.value > this.threshold) {
            console.warn(`🔄 Layout shift detected: ${(entry.value * 1000).toFixed(2)}ms`);
          }
        }
      });
      
      try {
        this.observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }
  
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * React hook for optimized DOM operations
 * @param {Function} operation - DOM operation to optimize
 * @param {Array} dependencies - Dependencies for the operation
 */
export const useOptimizedDOMOperation = (operation, dependencies = []) => {
  const { useEffect, useCallback } = React;
  
  const optimizedOperation = useCallback(() => {
    batchDOMOperations(operation);
  }, dependencies);
  
  useEffect(() => {
    optimizedOperation();
  }, [optimizedOperation]);
  
  return optimizedOperation;
};

/**
 * Intersection Observer utility for lazy loading
 * @param {Element} target - Target element
 * @param {Function} callback - Callback when intersecting
 * @param {object} options - Observer options
 * @returns {IntersectionObserver} - Observer instance
 */
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target, entry);
      }
    });
  }, mergedOptions);
};

// Initialize layout shift monitor for development
if (process.env.NODE_ENV === 'development') {
  const monitor = new LayoutShiftMonitor();
  monitor.start();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    monitor.stop();
  });
}