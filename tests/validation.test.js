/**
 * Tests for the validation utilities
 */
import {
    isValidCard,
    validateCards,
    validateDecks,
    validateCountingSystem,
    validatePenetration,
    validateTrueCount,
    validateBankroll,
    validateBetLimits,
    validateGameSettings,
    VALID_CARDS,
    VALID_COUNTING_SYSTEMS
} from '../src/static/js/validation.js';

describe('Card Validation', () => {
    test('should validate valid card values', () => {
        VALID_CARDS.forEach(card => {
            expect(isValidCard(card)).toBe(true);
            expect(isValidCard(card.toLowerCase())).toBe(true);
        });
    });

    test('should reject invalid card values', () => {
        expect(isValidCard('1')).toBe(false);
        expect(isValidCard('11')).toBe(false);
        expect(isValidCard('X')).toBe(false);
        expect(isValidCard('')).toBe(false);
        expect(isValidCard(null)).toBe(false);
        expect(isValidCard(undefined)).toBe(false);
        expect(isValidCard({})).toBe(false);
    });

    test('should validate arrays of cards', () => {
        expect(validateCards(['A', 'K', 'Q', 'J', '10']).isValid).toBe(true);
        expect(validateCards(['a', 'k', 'q', 'j', '10']).isValid).toBe(true);
        
        const invalidResult = validateCards(['A', 'X', '10']);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.message).toContain('Invalid card value: X');
    });
});

describe('Game Settings Validation', () => {
    test('should validate number of decks', () => {
        expect(validateDecks(1).isValid).toBe(true);
        expect(validateDecks(6).isValid).toBe(true);
        expect(validateDecks(10).isValid).toBe(true);
        
        expect(validateDecks(0).isValid).toBe(false);
        expect(validateDecks(11).isValid).toBe(false);
        expect(validateDecks('six').isValid).toBe(false);
    });

    test('should validate counting systems', () => {
        VALID_COUNTING_SYSTEMS.forEach(system => {
            expect(validateCountingSystem(system).isValid).toBe(true);
        });
        
        expect(validateCountingSystem('invalid').isValid).toBe(false);
        expect(validateCountingSystem('').isValid).toBe(false);
        expect(validateCountingSystem(null).isValid).toBe(false);
    });

    test('should validate penetration percentage', () => {
        expect(validatePenetration(0.5).isValid).toBe(true);
        expect(validatePenetration(1).isValid).toBe(true);
        expect(validatePenetration(100).isValid).toBe(true);
        
        expect(validatePenetration(0).isValid).toBe(false);
        expect(validatePenetration(101).isValid).toBe(false);
        expect(validatePenetration('fifty').isValid).toBe(false);
    });

    test('should validate true count', () => {
        expect(validateTrueCount(-20).isValid).toBe(true);
        expect(validateTrueCount(0).isValid).toBe(true);
        expect(validateTrueCount(20).isValid).toBe(true);
        
        expect(validateTrueCount(-21).isValid).toBe(false);
        expect(validateTrueCount(21).isValid).toBe(false);
        expect(validateTrueCount('high').isValid).toBe(false);
    });

    test('should validate bankroll', () => {
        expect(validateBankroll(0).isValid).toBe(true);
        expect(validateBankroll(1000).isValid).toBe(true);
        
        expect(validateBankroll(-1).isValid).toBe(false);
        expect(validateBankroll('thousand').isValid).toBe(false);
    });

    test('should validate bet limits', () => {
        expect(validateBetLimits(10, 100).isValid).toBe(true);
        expect(validateBetLimits(10, 10).isValid).toBe(true);
        
        const invalidMin = validateBetLimits(-1, 100);
        expect(invalidMin.isValid).toBe(false);
        expect(invalidMin.message).toContain('Minimum bet');
        
        const invalidMax = validateBetLimits(10, 0);
        expect(invalidMax.isValid).toBe(false);
        expect(invalidMax.message).toContain('Maximum bet');
        
        const invalidRange = validateBetLimits(100, 10);
        expect(invalidRange.isValid).toBe(false);
        expect(invalidRange.message).toContain('greater than');
    });

    test('should validate complete game settings', () => {
        const validSettings = {
            cards: ['A', 'K'],
            dealerCard: 'Q',
            decks: 6,
            penetration: 0.75,
            trueCount: 2.5,
            bankroll: 1000,
            minBet: 10,
            maxBet: 100,
            countingSystem: 'hiLo'
        };
        
        expect(validateGameSettings(validSettings).isValid).toBe(true);
        
        // Test invalid settings
        const invalidCards = { ...validSettings, cards: ['A', 'X'] };
        expect(validateGameSettings(invalidCards).isValid).toBe(false);
        
        const invalidDecks = { ...validSettings, decks: 0 };
        expect(validateGameSettings(invalidDecks).isValid).toBe(false);
        
        const invalidBets = { ...validSettings, minBet: 100, maxBet: 50 };
        expect(validateGameSettings(invalidBets).isValid).toBe(false);
    });
});
