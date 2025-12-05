/**
 * Storage Utilities
 * Wrapper functions for localStorage with JSON support
 */

const STORAGE_PREFIX = 'dsu_';

/**
 * Get item from localStorage
 * @param {string} key 
 * @returns {any} parsed value or null
 */
export function getStorage(key) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Set item to localStorage
 * @param {string} key 
 * @param {any} value 
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

/**
 * Remove item from localStorage
 * @param {string} key 
 */
export function removeStorage(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all items with prefix
 */
export function clearStorage() {
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .forEach(key => localStorage.removeItem(key));
}
