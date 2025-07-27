/**
 * @typedef {Object} ApiRequestOptions
 * @property {string} [method='GET'] - The HTTP method to use
 * @property {Object} [headers={}] - Request headers
 * @property {Object|string} [body] - Request body (will be stringified if an object)
 * @property {string} [credentials='same-origin'] - Credentials mode for the request
 * @property {string} [mode='cors'] - Request mode
 */

/**
 * @typedef {Object} ApiErrorDetails
 * @property {string} [message] - Error message
 * @property {string} [code] - Error code
 * @property {Object} [details] - Additional error details
 */

/**
 * API utility module for making requests to the Blackjack API
 * @module api
 * @description Provides a wrapper around the fetch API with request/response interception,
 * error handling, and retry logic for the Blackjack application.
 */

/**
 * Base API URL - can be configured based on environment
 * @type {string}
 * @constant
 */
const API_BASE_URL = window.location.origin + '/api';

/**
 * Maximum number of retry attempts for failed requests
 * @type {number}
 * @constant
 */
const MAX_RETRIES = 3;

/**
 * Maximum delay between retry attempts in milliseconds
 * @type {number}
 * @constant
 */
const MAX_RETRY_DELAY = 30000; // 30 seconds

/**
 * Makes an API request with built-in error handling and retry logic.
 * @param {string} endpoint - The API endpoint to call (e.g., '/analyze')
 * @param {ApiRequestOptions} [options={}] - Fetch options
 * @param {number} [retries=MAX_RETRIES] - Number of retry attempts on failure
 * @returns {Promise<Object>} The parsed JSON response
 * @throws {ApiError} If the request fails after all retries or if the response is not valid JSON
 * @example
 * // Make a GET request
 * const data = await apiRequest('/status');
 * 
 * @example
 * // Make a POST request with a body
 * const result = await apiRequest('/analyze', {
 *   method: 'POST',
 *   body: { cards: ['A', 'K'], dealerCard: '10' }
 * });
 */
async function apiRequest(endpoint, options = {}, retries = MAX_RETRIES) {
    // Ensure endpoint starts with a slash
    if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    // Prepare the request options
    const requestOptions = {
        ...options,
        headers,
        credentials: 'same-origin',
        mode: 'cors'
    };

    // If we have a body and it's an object, stringify it
    if (requestOptions.body && typeof requestOptions.body === 'object') {
        requestOptions.body = JSON.stringify(requestOptions.body);
    }

    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, requestOptions);
            const data = await parseResponse(response);
            
            // If we got a successful response, return the data
            if (response.ok) {
                return data;
            }
            
            // If we got an error response, throw an error
            throw new ApiError(
                data?.error?.message || 'An unknown error occurred',
                response.status,
                data?.error?.code || 'UNKNOWN_ERROR',
                data?.error?.details
            );
        } catch (error) {
            lastError = error;
            
            // Don't retry on 4xx errors (except 429 - Too Many Requests)
            if (error.status >= 400 && error.status < 500 && error.status !== 429) {
                throw error;
            }
            
            // Calculate delay with exponential backoff (starting at 1 second)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
            
            // If we have more retries left, wait and try again
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError;
}

/**
 * Parses the API response, handling different content types and error cases.
 * @param {Response} response - The fetch Response object
 * @returns {Promise<Object|string|null>} The parsed response data (JSON object, text, or null)
 * @throws {Error} If the response cannot be parsed as JSON when content-type is application/json
 * @example
 * // Example with JSON response
 * const response = await fetch('/api/endpoint');
 * const data = await parseResponse(response);
 * 
 * @example
 * // Example with empty response (204 No Content)
 * const response = await fetch('/api/endpoint', { method: 'DELETE' });
 * const data = await parseResponse(response); // Returns null
 */
async function parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    // If the response is empty, return null
    if (response.status === 204 || !contentType) {
        return null;
    }
    
    // If the response is JSON, parse it
    if (contentType.includes('application/json')) {
        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to parse JSON response: ${error.message}`);
        }
    }
    
    // For non-JSON responses, return the text
    return response.text();
}

/**
 * Represents an error returned by the API or encountered during API communication.
 * @extends Error
 * @property {number} status - HTTP status code of the error response
 * @property {string} code - Application-specific error code
 * @property {Object} details - Additional error details or context
 * @example
 * // Create an API error
 * throw new ApiError('Resource not found', 404, 'NOT_FOUND', { resourceId: 123 });
 * 
 * @example
 * // Handle an API error
 * try {
 *   await apiRequest('/nonexistent');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`API Error (${error.status}): ${error.message}`);
 *     if (error.status === 404) {
 *       // Handle not found
 *     }
 *   }
 * }
 */
class ApiError extends Error {
    /**
     * Creates a new ApiError instance.
     * @param {string} message - Human-readable error message
     * @param {number} status - HTTP status code (e.g., 400, 404, 500)
     * @param {string} [code='API_ERROR'] - Application-specific error code
     * @param {Object} [details={}] - Additional error details or context
     */
    constructor(message, status, code = 'API_ERROR', details = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
        
        // Maintain proper stack trace in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

/**
 * @typedef {Object} CardAnalysisRequest
 * @property {string[]} cards - Array of card values in the current hand
 * @property {string} [dealerCard] - Dealer's up card (if known)
 * @property {number} [decks=6] - Number of decks in the shoe
 * @property {string} [countingSystem='hiLo'] - The card counting system to use
 * @property {number} [trueCount] - Current true count (if known)
 */

/**
 * @typedef {Object} CardAnalysisResponse
 * @property {number} runningCount - Current running count
 * @property {number} trueCount - Current true count
 * @property {string} recommendation - Recommended action (hit, stand, etc.)
 * @property {number} probability - Probability of winning the hand
 * @property {Object} counts - Count values for different card ranks
 */

/**
 * Analyzes the current card situation and returns recommendations.
 * @param {CardAnalysisRequest} data - The card analysis request data
 * @returns {Promise<CardAnalysisResponse>} The analysis results
 * @throws {ApiError} If the request fails or returns an error
 * @example
 * const analysis = await analyzeCards({
 *   cards: ['A', 'K'],
 *   dealerCard: '10',
 *   decks: 6,
 *   countingSystem: 'hiLo'
 * });
 * console.log(analysis.recommendation); // e.g., 'stand'
 */
async function analyzeCards(data) {
    return apiRequest('/analyze', {
        method: 'POST',
        body: data
    });
}

/**
 * @typedef {Object} StrategyRequest
 * @property {string[]} playerCards - Array of card values in the player's hand
 * @property {string} dealerCard - Dealer's up card
 * @property {number} [decks=6] - Number of decks in the shoe
 * @property {string} [countingSystem='hiLo'] - The card counting system to use
 * @property {number} [trueCount] - Current true count (if known)
 */

/**
 * @typedef {Object} StrategyResponse
 * @property {string} action - Recommended action (hit, stand, double, split, etc.)
 * @property {string} reason - Explanation of the recommendation
 * @property {number} expectedValue - Expected value of the recommended action
 * @property {Object} alternatives - Alternative actions with their expected values
 */

/**
 * Gets the optimal strategy recommendation for the current game state.
 * @param {StrategyRequest} data - The strategy request data
 * @returns {Promise<StrategyResponse>} The strategy recommendation
 * @throws {ApiError} If the request fails or returns an error
 * @example
 * const strategy = await getOptimalStrategy({
 *   playerCards: ['A', '8'],
 *   dealerCard: '6',
 *   decks: 6
 * });
 * console.log(`Recommended action: ${strategy.action}`);
 */
async function getOptimalStrategy(data) {
    return apiRequest('/strategy', {
        method: 'POST',
        body: data
    });
}

/**
 * @typedef {Object} BankrollRequest
 * @property {number} bankroll - Current bankroll amount
 * @property {number} minBet - Minimum bet amount
 * @property {number} maxBet - Maximum bet amount
 * @property {number} riskTolerance - Risk tolerance (0-1)
 * @property {number} [trueCount] - Current true count (if known)
 */

/**
 * @typedef {Object} BankrollRecommendation
 * @property {number} recommendedBet - Recommended bet amount based on bankroll and count
 * @property {number} riskOfRuin - Probability of losing the entire bankroll
 * @property {number} expectedValue - Expected value per hand
 * @property {Object} betSpread - Recommended bet spread based on true count
 */

/**
 * Gets bankroll management recommendations based on current game state.
 * @param {BankrollRequest} data - The bankroll request data
 * @returns {Promise<BankrollRecommendation>} The bankroll recommendations
 * @throws {ApiError} If the request fails or returns an error
 * @example
 * const recommendations = await getBankrollRecommendations({
 *   bankroll: 1000,
 *   minBet: 10,
 *   maxBet: 500,
 *   riskTolerance: 0.05,
 *   trueCount: 2.5
 * });
 * console.log(`Recommended bet: $${recommendations.recommendedBet.toFixed(2)}`);
 */
async function getBankrollRecommendations(data) {
    return apiRequest('/bankroll', {
        method: 'POST',
        body: data
    });
}

/**
 * @typedef {Object} SystemStatus
 * @property {string} status - Current system status (e.g., 'ok', 'maintenance')
 * @property {string} version - Current API version
 * @property {string} timestamp - Server timestamp
 * @property {Object} [metrics] - System metrics (if available)
 */

/**
 * Gets the current system status and API version information.
 * @returns {Promise<SystemStatus>} The system status information
 * @throws {ApiError} If the request fails
 * @example
 * const status = await getSystemStatus();
 * console.log(`API version: ${status.version}, Status: ${status.status}`);
 */
async function getSystemStatus() {
    return apiRequest('/status', {
        method: 'GET'
    });
}

// Export the API functions
export {
    analyzeCards,
    getOptimalStrategy,
    getBankrollRecommendations,
    getSystemStatus,
    apiRequest,
    ApiError
};
