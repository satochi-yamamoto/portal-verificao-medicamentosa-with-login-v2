/**
 * Extend module shim for browser compatibility
 * Provides fallback implementation for extend package
 */

function extend() {
  let options, name, src, copy, copyIsArray, clone
  let target = arguments[0] || {}
  let i = 1
  const length = arguments.length
  let deep = false

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target
    // Skip the boolean and the target
    target = arguments[i] || {}
    i++
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {}
  }

  // Extend jQuery itself if only one argument is passed
  if (i === length) {
    target = this
    i--
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        src = target[name]
        copy = options[name]

        // Prevent never-ending loop
        if (target === copy) {
          continue
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false
            clone = src && Array.isArray(src) ? src : []
          } else {
            clone = src && isPlainObject(src) ? src : {}
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy)

        // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
  }

  // Return the modified object
  return target
}

function isPlainObject(obj) {
  const toString = Object.prototype.toString
  
  if (!obj || toString.call(obj) !== '[object Object]') {
    return false
  }

  const hasOwnProperty = Object.prototype.hasOwnProperty
  
  // Not own constructor property must be Object
  if (obj.constructor &&
      !hasOwnProperty.call(obj, 'constructor') &&
      !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
    return false
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  let key
  for (key in obj) {}

  return key === undefined || hasOwnProperty.call(obj, key)
}

// Export both named and default exports for compatibility
export { extend }
export default extend