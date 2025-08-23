import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Hook for performance-optimized DOM operations
 * @param {Function} operation - DOM operation to optimize
 * @param {Array} deps - Dependencies
 * @returns {Function} - Optimized operation function
 */
export const useOptimizedDOMOperation = (operation, deps = []) => {
  const operationRef = useRef(operation);
  operationRef.current = operation;

  const optimizedOperation = useCallback(() => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const result = operationRef.current();
        resolve(result);
      });
    });
  }, deps);

  return optimizedOperation;
};

/**
 * Hook for throttled resize handling
 * @param {Function} callback - Resize callback
 * @param {number} delay - Throttle delay
 */
export const useThrottledResize = (callback, delay = 100) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);
  callbackRef.current = callback;

  const throttledCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay]);

  useEffect(() => {
    window.addEventListener('resize', throttledCallback);
    return () => {
      window.removeEventListener('resize', throttledCallback);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [throttledCallback]);
};

/**
 * Hook for performance monitoring in components
 * @param {string} componentName - Name of the component
 * @returns {object} - Performance monitoring utilities
 */
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(0);
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = performance.now();
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} mounted`);
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        const unmountTime = performance.now();
        console.log(`🔚 ${componentName} unmounted after ${(unmountTime - mountTime.current).toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  const measureRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const finishRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 16 && process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
      renderStartTime.current = 0;
    }
  }, [componentName]);

  return { measureRender, finishRender };
};