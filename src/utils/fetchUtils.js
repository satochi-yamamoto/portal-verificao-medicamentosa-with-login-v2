/**
 * Enhanced fetch utilities with proper error handling and retry logic
 */

/**
 * Enhanced fetch with timeout, retry logic, and proper error handling
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} - Response or error
 */
export async function safeFetch(url, options = {}, retries = 3, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle different types of errors
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error - check your connection');
    }

    // Retry logic for network errors
    if (retries > 0 && (
      error.message.includes('Network error') ||
      error.message.includes('timeout') ||
      error.name === 'NetworkError'
    )) {
      console.warn(`Fetch failed, retrying... (${retries} attempts left)`);
      await sleep(1000); // Wait 1 second before retry
      return safeFetch(url, options, retries - 1, timeout);
    }

    throw error;
  }
}

/**
 * GET request with error handling
 * @param {string} url - URL to fetch
 * @param {object} options - Additional options
 * @returns {Promise} - JSON response
 */
export async function safeGet(url, options = {}) {
  try {
    const response = await safeFetch(url, { method: 'GET', ...options });
    return await response.json();
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
}

/**
 * POST request with error handling
 * @param {string} url - URL to post to
 * @param {object} data - Data to post
 * @param {object} options - Additional options
 * @returns {Promise} - JSON response
 */
export async function safePost(url, data, options = {}) {
  try {
    const response = await safeFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if we're online
 * @returns {boolean} - Online status
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Wait for online status
 * @returns {Promise} - Resolves when online
 */
export function waitForOnline() {
  return new Promise(resolve => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve(true);
    };

    window.addEventListener('online', handleOnline);
  });
}

/**
 * Enhanced error handler for API calls
 * @param {Error} error - Error to handle
 * @param {object} options - Handler options
 * @returns {object} - Standardized error object
 */
export function handleFetchError(error, options = {}) {
  const { 
    showToast = true, 
    logError = true, 
    fallbackMessage = 'An unexpected error occurred' 
  } = options;

  let errorMessage = fallbackMessage;
  let errorCode = 'UNKNOWN_ERROR';

  // Categorize different types of errors
  if (error.message.includes('Network error')) {
    errorMessage = 'Network error - please check your connection';
    errorCode = 'NETWORK_ERROR';
  } else if (error.message.includes('timeout')) {
    errorMessage = 'Request timeout - please try again';
    errorCode = 'TIMEOUT_ERROR';
  } else if (error.message.includes('HTTP Error: 404')) {
    errorMessage = 'Resource not found';
    errorCode = 'NOT_FOUND';
  } else if (error.message.includes('HTTP Error: 500')) {
    errorMessage = 'Server error - please try again later';
    errorCode = 'SERVER_ERROR';
  } else if (error.message.includes('HTTP Error: 401')) {
    errorMessage = 'Authentication required';
    errorCode = 'AUTH_ERROR';
  } else if (error.message.includes('HTTP Error: 403')) {
    errorMessage = 'Access denied';
    errorCode = 'FORBIDDEN';
  }

  if (logError) {
    console.error(`[${errorCode}] ${errorMessage}:`, error);
  }

  return {
    message: errorMessage,
    code: errorCode,
    original: error
  };
}