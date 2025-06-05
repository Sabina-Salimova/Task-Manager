// http.js

// ─────────────────────────────────────────────────────────────────────────────
// 1. Http Class Definition
// ─────────────────────────────────────────────────────────────────────────────
class Http {
  /**
   * Constructor
   * @param {string} baseURL - The base URL of the API
   */
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Public HTTP Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * GET request
   * @param {string} route   - API route (e.g., '/tasks')
   * @param {object} params  - Optional query parameters
   * @returns {Promise<object>} - Parsed JSON response
   */
  async get(route, params = {}) {
    return this._request('GET', route, null, params);
  }

  /**
   * POST request
   * @param {string} route   - API route (e.g., '/tasks')
   * @param {object} body    - JSON body to send
   * @param {object} params  - Optional query parameters
   * @returns {Promise<object>} - Parsed JSON response
   */
  async post(route, body = {}, params = {}) {
    return this._request('POST', route, body, params);
  }

  /**
   * PUT request
   * @param {string} route   - API route (e.g., '/tasks/:id')
   * @param {object} body    - JSON body to send
   * @param {object} params  - Optional query parameters
   * @returns {Promise<object>} - Parsed JSON response
   */
  async put(route, body = {}, params = {}) {
    return this._request('PUT', route, body, params);
  }

  /**
   * DELETE request
   * @param {string} route   - API route (e.g., '/tasks/:id')
   * @param {object} params  - Optional query parameters
   * @returns {Promise<object>} - Parsed JSON response
   */
  async delete(route, params = {}) {
    return this._request('DELETE', route, null, params);
  }

  /**
   * PATCH request
   * @param {string} route   - API route (e.g., '/tasks/:id')
   * @param {object} body    - JSON body to send
   * @param {object} params  - Optional query parameters
   * @returns {Promise<object>} - Parsed JSON response
   */
  async patch(route, body = {}, params = {}) {
    return this._request('PATCH', route, body, params);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Private Helper: Build Full URL with Query Params
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Constructs a complete URL including query parameters
   * @param {string} route   - API route (e.g., '/tasks')
   * @param {object} params  - Key/value pairs for query string
   * @returns {URL}          - URL object with appended query params
   */
  _buildURL(route, params) {
    const url = new URL(`${this.baseURL}${route}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
    return url;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Private Helper: Perform the Fetch Request
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Performs the fetch call using the specified method, route, body, and params
   * @param {string} method  - HTTP method ('GET', 'POST', etc.)
   * @param {string} route   - API route
   * @param {object|null} body   - JSON body (if applicable)
   * @param {object} params  - Optional query parameters
   * @returns {Promise<object>} - Parsed JSON response
   * @throws {Error} - If network or response status indicates failure
   */
  async _request(method, route, body = null, params = {}) {
    // Build complete URL including query parameters
    const url = this._buildURL(route, params);

    // Set up fetch options
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    // Attach JSON body for POST, PUT, PATCH
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      // Execute fetch call
      const response = await fetch(url, options);

      // Throw if non-2xx status code
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse and return JSON
      return await response.json();
    } catch (error) {
      // Log error for debugging, then rethrow
      console.error(`Request failed: ${error}`);
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Export the Http Class
// ─────────────────────────────────────────────────────────────────────────────
export default Http;

