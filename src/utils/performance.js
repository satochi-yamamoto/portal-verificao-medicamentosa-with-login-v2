// Performance utilities for optimizing heavy operations and preventing violations

/**
 * Monitor and prevent forced reflows
 * @param {Function} operation - DOM operation to monitor
 * @param {string} operationName - Name of the operation for logging
 * @returns {any} - Result of the operation
 */
export const monitorReflow = (operation, operationName = 'DOM Operation') => {
  const start = performance.now();
  
  // Use requestAnimationFrame to batch DOM operations
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const result = operation();
      const duration = performance.now() - start;
      
      if (duration > 16) {
        console.warn(`⚠️ ${operationName} caused potential reflow: ${duration.toFixed(2)}ms`);
      }
      
      resolve(result);
    });
  });
};


/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function calls to once per specified time
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * RequestAnimationFrame-based scheduler for heavy tasks
 * Breaks heavy work into chunks to prevent UI blocking
 * @param {Array} workQueue - Array of work items
 * @param {Function} processItem - Function to process each item
 * @param {number} chunkSize - Number of items to process per frame
 * @returns {Promise} - Promise that resolves when all work is done
 */
export const scheduleWork = (workQueue, processItem, chunkSize = 10) => {
  return new Promise((resolve) => {
    const work = [...workQueue]
    
    const processChunk = () => {
      const startTime = performance.now()
      
      // Process items in chunks, but don't exceed 16ms per frame
      while (work.length > 0 && (performance.now() - startTime < 16)) {
        const chunk = work.splice(0, chunkSize)
        chunk.forEach(processItem)
      }
      
      if (work.length > 0) {
        // Use requestAnimationFrame for smooth UI
        requestAnimationFrame(processChunk)
      } else {
        resolve()
      }
    }
    
    processChunk()
  })
}

/**
 * Use requestIdleCallback for heavy operations when available
 * Falls back to setTimeout with longer delay if not available
 * @param {Function} callback - Function to execute
 * @param {object} options - Options for requestIdleCallback
 * @returns {number} - ID for cancellation
 */
export const scheduleIdleWork = (callback, options = { timeout: 1000 }) => {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, options)
  } else {
    // Fallback for environments without requestIdleCallback
    return setTimeout(callback, 50) // Longer delay to reduce impact
  }
}

/**
 * Cancel idle work
 * @param {number} id - ID returned by scheduleIdleWork
 */
export const cancelIdleWork = (id) => {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Process large arrays in chunks using idle time
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process each item
 * @param {number} chunkSize - Size of each chunk
 * @returns {Promise} - Promise that resolves when processing is complete
 */
export const processInIdleTime = (items, processor, chunkSize = 100) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize))
    }
    
    let currentChunk = 0
    
    const processNextChunk = (deadline) => {
      try {
        while (currentChunk < chunks.length && 
               (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
          const chunk = chunks[currentChunk]
          chunk.forEach(processor)
          currentChunk++
          
          // Give other tasks a chance to run
          if (deadline.timeRemaining() <= 0 && !deadline.didTimeout) {
            break
          }
        }
        
        if (currentChunk < chunks.length) {
          scheduleIdleWork(processNextChunk, { timeout: 1000 })
        } else {
          resolve()
        }
      } catch (error) {
        reject(error)
      }
    }
    
    scheduleIdleWork(processNextChunk, { timeout: 1000 })
  })
}

/**
 * Optimized setTimeout that prevents performance violations
 * @param {Function} callback - Function to execute
 * @param {number} delay - Delay in milliseconds
 * @returns {number} - Timer ID for cancellation
 */
export const optimizedSetTimeout = (callback, delay = 0) => {
  if (delay <= 16) {
    // For very short delays, use requestAnimationFrame
    return requestAnimationFrame(() => {
      const start = performance.now();
      const result = callback();
      const duration = performance.now() - start;
      
      if (duration > 50) {
        console.warn(`⚠️ Callback took ${duration.toFixed(2)}ms - consider optimization`);
      }
      
      return result;
    })
  } else if (delay > 50) {
    // For long delays, break into chunks to prevent violations
    const chunks = Math.ceil(delay / 50);
    let remainingChunks = chunks;
    
    const processChunk = () => {
      remainingChunks--;
      if (remainingChunks <= 0) {
        const start = performance.now();
        const result = callback();
        const duration = performance.now() - start;
        
        if (duration > 50) {
          console.warn(`⚠️ Callback took ${duration.toFixed(2)}ms - consider optimization`);
        }
        
        return result;
      } else {
        requestAnimationFrame(processChunk);
      }
    };
    
    return requestAnimationFrame(processChunk);
  } else {
    // For moderate delays, use regular setTimeout with monitoring
    return setTimeout(() => {
      const start = performance.now();
      const result = callback();
      const duration = performance.now() - start;
      
      if (duration > 50) {
        console.warn(`⚠️ Callback took ${duration.toFixed(2)}ms - consider optimization`);
      }
      
      return result;
    }, delay);
  }
}

/**
 * Cancel an optimized timeout
 * @param {number} id - Timer ID returned by optimizedSetTimeout
 */
export const clearOptimizedTimeout = (id) => {
  // Try both cancellation methods since we don't know which was used
  cancelAnimationFrame(id)
  clearTimeout(id)
}

/**
 * Batch DOM operations to prevent layout thrashing
 * @param {Function} operation - Function that performs DOM operations
 * @returns {Promise} - Promise that resolves after the operation
 */
export const batchDOMUpdates = (operation) => {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      operation()
      resolve()
    })
  })
}

/**
 * Measure performance of a function
 * @param {string} name - Name of the operation
 * @param {Function} fn - Function to measure
 * @returns {Promise} - Promise that resolves with the function result
 */
export const measurePerformance = async (name, fn) => {
  const startTime = performance.now()
  
  try {
    const result = await fn()
    const endTime = performance.now()
    const duration = endTime - startTime
    
    if (duration > 50) {
      console.warn(`⚠️ Performance: ${name} took ${duration.toFixed(2)}ms`)
    } else {
      console.log(`✅ Performance: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const endTime = performance.now()
    const duration = endTime - startTime
    console.error(`❌ Performance: ${name} failed after ${duration.toFixed(2)}ms`, error)
    throw error
  }
}

/**
 * Create a performance-optimized event handler
 * @param {Function} handler - Original event handler
 * @param {number} delay - Debounce delay (default: 100ms)
 * @returns {Function} - Optimized event handler
 */
export const createOptimizedHandler = (handler, delay = 100) => {
  const debouncedHandler = debounce(handler, delay)
  
  return (...args) => {
    // Use requestAnimationFrame to ensure smooth UI updates
    requestAnimationFrame(() => {
      debouncedHandler(...args)
    })
  }
}

/**
 * Monitor and log long-running tasks
 */
export class PerformanceMonitor {
  constructor() {
    this.tasks = new Map()
  }
  
  start(taskName) {
    this.tasks.set(taskName, {
      startTime: performance.now(),
      name: taskName
    })
  }
  
  end(taskName) {
    const task = this.tasks.get(taskName)
    if (!task) {
      console.warn(`No task found with name: ${taskName}`)
      return
    }
    
    const duration = performance.now() - task.startTime
    this.tasks.delete(taskName)
    
    if (duration > 100) {
      console.warn(`⚠️ Long task: ${taskName} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  measure(taskName, fn) {
    this.start(taskName)
    const result = fn()
    this.end(taskName)
    return result
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Web Worker utilities for CPU-intensive tasks
 */
export const createWorker = (workerFunction) => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  })
  return new Worker(URL.createObjectURL(blob))
}

/**
 * Utility to break down large arrays into processable chunks
 * @param {Array} array - Large array to process
 * @param {Function} processor - Function to process each chunk
 * @param {number} chunkSize - Size of each chunk
 * @returns {Promise} - Promise that resolves when processing is complete
 */
export const processInChunks = async (array, processor, chunkSize = 100) => {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  
  for (const chunk of chunks) {
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        processor(chunk)
        resolve()
      })
    })
  }
}