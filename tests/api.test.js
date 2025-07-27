/**
 * Tests for the API utility module
 */
import { analyzeCards, getOptimalStrategy, getBankrollRecommendations, ApiError } from '../src/static/js/api.js';

// Mock the global fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock response helper
const mockResponse = (status, data) => {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        headers: {
            get: () => 'application/json',
        },
        json: () => Promise.resolve(data),
    });
};

// Mock error response helper
const mockErrorResponse = (status, errorData) => {
    return Promise.resolve({
        ok: false,
        status,
        headers: {
            get: () => 'application/json',
        },
        json: () => Promise.resolve({
            error: {
                message: errorData?.message || 'An error occurred',
                code: errorData?.code || 'UNKNOWN_ERROR',
                details: errorData?.details || {},
            },
        }),
    });
};

describe('API Utilities', () => {
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        // Reset mocks before each test
        mockFetch.mockClear();
        console.error = jest.fn();
    });
    
    afterAll(() => {
        // Restore console.error
        console.error = originalConsoleError;
    });
    
    describe('analyzeCards', () => {
        const requestData = {
            cards: ['A', 'K'],
            dealerCard: 'Q',
            trueCount: 2.5,
            decks: 6,
            countingSystem: 'hiLo',
            penetration: 0.75
        };
        
        const successResponse = {
            analysis: {
                runningCount: 5,
                trueCount: 2.5,
                cardsRemaining: 200,
                deckPenetration: 0.36,
                recommendation: 'HIT'
            }
        };
        
        test('should make a POST request to /analyze with correct data', async () => {
            mockFetch.mockResolvedValueOnce(mockResponse(200, successResponse));
            
            const result = await analyzeCards(requestData);
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/analyze'),
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                })
            );
            
            expect(result).toEqual(successResponse);
        });
        
        test('should handle API errors', async () => {
            const errorData = {
                message: 'Invalid card value',
                code: 'INVALID_CARD',
                details: { card: 'X' }
            };
            
            mockFetch.mockResolvedValueOnce(mockErrorResponse(400, errorData));
            
            await expect(analyzeCards({ cards: ['X'] }))
                .rejects
                .toThrow(ApiError);
                
            await expect(analyzeCards({ cards: ['X'] }))
                .rejects
                .toMatchObject({
                    message: errorData.message,
                    status: 400,
                    code: errorData.code,
                    details: errorData.details
                });
        });
        
        test('should retry on network errors', async () => {
            // First attempt fails with network error
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            // Second attempt succeeds
            mockFetch.mockResolvedValueOnce(mockResponse(200, successResponse));
            
            const result = await analyzeCards(requestData, 2);
            
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result).toEqual(successResponse);
        });
    });
    
    describe('getOptimalStrategy', () => {
        const requestData = {
            playerCards: ['A', 'K'],
            dealerCard: 'Q',
            trueCount: 2.5,
            decks: 6,
            countingSystem: 'hiLo'
        };
        
        const successResponse = {
            action: 'STAND',
            confidence: 0.95,
            alternatives: [
                { action: 'HIT', confidence: 0.03 },
                { action: 'DOUBLE', confidence: 0.02 }
            ]
        };
        
        test('should make a POST request to /strategy with correct data', async () => {
            mockFetch.mockResolvedValueOnce(mockResponse(200, successResponse));
            
            const result = await getOptimalStrategy(requestData);
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/strategy'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(requestData),
                })
            );
            
            expect(result).toEqual(successResponse);
        });
    });
    
    describe('getBankrollRecommendations', () => {
        const requestData = {
            bankroll: 1000,
            trueCount: 2.5,
            riskTolerance: 0.02,
            minBet: 10,
            maxBet: 500
        };
        
        const successResponse = {
            recommendedBet: 50,
            riskOfRuin: 0.01,
            expectedValue: 12.5,
            kellyBet: 75,
            halfKellyBet: 37.5
        };
        
        test('should make a POST request to /bankroll with correct data', async () => {
            mockFetch.mockResolvedValueOnce(mockResponse(200, successResponse));
            
            const result = await getBankrollRecommendations(requestData);
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/bankroll'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(requestData),
                })
            );
            
            expect(result).toEqual(successResponse);
        });
    });
    
    describe('ApiError', () => {
        test('should create an ApiError with default values', () => {
            const error = new ApiError('Test error');
            
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.message).toBe('Test error');
            expect(error.status).toBe(500);
            expect(error.code).toBe('API_ERROR');
            expect(error.details).toEqual({});
            expect(error.stack).toBeDefined();
        });
        
        test('should create an ApiError with custom values', () => {
            const error = new ApiError('Not found', 404, 'NOT_FOUND', { id: 123 });
            
            expect(error.message).toBe('Not found');
            expect(error.status).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
            expect(error.details).toEqual({ id: 123 });
        });
    });
});
