/**
 * Utility functions for safe module imports and CJS/ESM interoperability
 */

/**
 * Safely import a module with fallback support
 * @param {string} moduleName - Name or path of the module to import
 * @param {any} fallback - Fallback value if import fails
 * @returns {Promise<any>} - Imported module or fallback
 */
export const safeImport = async (moduleName, fallback = null) => {
  try {
    const module = await import(moduleName)
    // Handle different export patterns
    return module.default || module
  } catch (error) {
    console.warn(`Failed to import ${moduleName}:`, error.message)
    if (fallback !== null) {
      console.info(`Using fallback for ${moduleName}`)
      return fallback
    }
    throw error
  }
}

/**
 * Import CommonJS module with proper interop
 * @param {string} modulePath - Path to the CJS module
 * @returns {Promise<any>} - Module with proper export handling
 */
export const importCJS = async (modulePath) => {
  try {
    if (typeof window !== 'undefined') {
      // In browser environment, use dynamic import
      const module = await import(modulePath)
      // Handle various CJS export patterns
      if (module.default && typeof module.default === 'function') {
        return module.default
      }
      if (module.default && module.default.default) {
        return module.default.default
      }
      return module.default || module
    } else {
      // In Node.js environment, use require
      const module = require(modulePath)
      return module.default || module
    }
  } catch (error) {
    console.error(`Failed to import CJS module ${modulePath}:`, error)
    throw error
  }
}

/**
 * Create a safe wrapper for modules that might have import issues
 * @param {string} moduleName - Module name
 * @param {Function} fallbackImplementation - Fallback function
 * @returns {Promise<any>} - Module or fallback
 */
export const createSafeModule = async (moduleName, fallbackImplementation) => {
  try {
    const module = await safeImport(moduleName)
    return module
  } catch (error) {
    console.warn(`Module ${moduleName} failed to load, using fallback implementation`)
    return { default: fallbackImplementation, [moduleName]: fallbackImplementation }
  }
}

/**
 * Polyfill for style-to-js functionality
 * @param {string} styleString - CSS style string
 * @returns {object} - Style object with camelCase properties
 */
export const styleStringToObject = (styleString) => {
  const styleObject = {}
  
  if (!styleString || typeof styleString !== 'string') {
    return styleObject
  }

  // Split by semicolon and process each rule
  styleString
    .split(';')
    .filter(rule => rule.trim())
    .forEach(rule => {
      const colonIndex = rule.indexOf(':')
      if (colonIndex === -1) return

      let property = rule.slice(0, colonIndex).trim()
      const value = rule.slice(colonIndex + 1).trim()

      if (!property || !value) return

      // Convert kebab-case to camelCase
      property = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())

      styleObject[property] = value
    })

  return styleObject
}

/**
 * Safe style parser with multiple fallback strategies
 * @param {string} styleString - CSS style string
 * @returns {Promise<object>} - Parsed style object
 */
export const safeStyleParser = async (styleString) => {
  // Try to use the actual style-to-js module
  try {
    const styleToJS = await safeImport('style-to-js')
    if (styleToJS && typeof styleToJS === 'function') {
      return styleToJS(styleString)
    }
  } catch (error) {
    console.warn('style-to-js import failed, using fallback')
  }

  // Fallback to our own implementation
  return styleStringToObject(styleString)
}

/**
 * Batch import multiple modules safely
 * @param {Array<{name: string, fallback?: any}>} modules - Array of module configurations
 * @returns {Promise<object>} - Object with imported modules
 */
export const batchSafeImport = async (modules) => {
  const results = {}
  
  await Promise.allSettled(
    modules.map(async ({ name, fallback }) => {
      try {
        results[name] = await safeImport(name, fallback)
      } catch (error) {
        console.warn(`Failed to import ${name}:`, error.message)
        if (fallback !== undefined) {
          results[name] = fallback
        }
      }
    })
  )

  return results
}

/**
 * Create a module loader with retry logic
 * @param {string} moduleName - Module name
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries (ms)
 * @returns {Promise<any>} - Loaded module
 */
export const retryImport = async (moduleName, maxRetries = 3, retryDelay = 100) => {
  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await safeImport(moduleName)
    } catch (error) {
      lastError = error
      if (attempt < maxRetries - 1) {
        console.warn(`Import attempt ${attempt + 1} failed for ${moduleName}, retrying...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  throw new Error(`Failed to import ${moduleName} after ${maxRetries} attempts: ${lastError.message}`)
}

/**
 * Check if a module is available without actually importing it
 * @param {string} moduleName - Module name to check
 * @returns {Promise<boolean>} - Whether module is available
 */
export const isModuleAvailable = async (moduleName) => {
  try {
    await import.meta.resolve?.(moduleName) || await import(moduleName)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Dynamic module loader with caching
 */
class ModuleCache {
  constructor() {
    this.cache = new Map()
    this.loading = new Map()
  }

  async load(moduleName, options = {}) {
    const { fallback, force = false } = options

    // Return cached module if available and not forcing reload
    if (!force && this.cache.has(moduleName)) {
      return this.cache.get(moduleName)
    }

    // If already loading, wait for that promise
    if (this.loading.has(moduleName)) {
      return this.loading.get(moduleName)
    }

    // Start loading
    const loadPromise = this._loadModule(moduleName, fallback)
    this.loading.set(moduleName, loadPromise)

    try {
      const module = await loadPromise
      this.cache.set(moduleName, module)
      this.loading.delete(moduleName)
      return module
    } catch (error) {
      this.loading.delete(moduleName)
      throw error
    }
  }

  async _loadModule(moduleName, fallback) {
    try {
      return await safeImport(moduleName, fallback)
    } catch (error) {
      if (fallback !== undefined) {
        console.warn(`Using fallback for ${moduleName}`)
        return fallback
      }
      throw error
    }
  }

  clear() {
    this.cache.clear()
    this.loading.clear()
  }

  has(moduleName) {
    return this.cache.has(moduleName)
  }
}

// Export singleton instance
export const moduleCache = new ModuleCache()