// Retrieve the API base URL from Vite's environment variables, defaulting to empty string (relative paths)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * A wrapper around native fetch that automatically prepends the API base URL.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/api/menu/')
 * @param {RequestInit} options - Standard fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiFetch = async (endpoint, options = {}) => {
  // Ensure we don't end up with double slashes if API_BASE_URL has a trailing slash
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = `${cleanBase}${cleanEndpoint}`;
  
  return fetch(url, options);
};
