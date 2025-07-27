/**
 * Tests for frontend utility functions
 */

// Mock the DOM elements and functions that would be available in the browser
const mockElements = {
  playerCards: { value: '' },
  dealerCard: { value: '' },
  trueCount: { value: '0' },
  recommendation: { textContent: '' },
  decision: { textContent: '' },
  riskLevel: { textContent: '' },
  winProbability: { textContent: '' },
  countDisplay: { textContent: '', className: '' },
  cardsRemaining: { textContent: '' },
  suggestion: { textContent: '' }
};

document.getElementById = jest.fn((id) => mockElements[id] || { value: '', textContent: '' });

// Import the functions we want to test
const {
  calculateHandValue,
  convertCardToValue,
  calculateTrueCount,
  getCountClass,
  isPair,
  hasSoftAce,
  translateAction
} = require('../../src/static/js/script.js');

describe('Frontend Utility Functions', () => {
  describe('calculateHandValue', () => {
    test('should calculate hand value correctly', () => {
      expect(calculateHandValue(['A', 'K'])).toBe(21);
      expect(calculateHandValue(['10', '10', 'A'])).toBe(21);
      expect(calculateHandValue(['A', 'A', '9'])).toBe(21);
      expect(calculateHandValue(['2', '3', '4'])).toBe(9);
      expect(calculateHandValue(['K', 'Q'])).toBe(20);
    });

    test('should handle multiple aces correctly', () => {
      expect(calculateHandValue(['A', 'A'])).toBe(12);
      expect(calculateHandValue(['A', 'A', 'A'])).toBe(13);
      expect(calculateHandValue(['A', 'A', '9'])).toBe(21);
    });
  });

  describe('convertCardToValue', () => {
    test('should convert card values correctly', () => {
      expect(convertCardToValue('A')).toBe(11);
      expect(convertCardToValue('K')).toBe(10);
      expect(convertCardToValue('Q')).toBe(10);
      expect(convertCardToValue('J')).toBe(10);
      expect(convertCardToValue('10')).toBe(10);
      expect(convertCardToValue('9')).toBe(9);
      expect(convertCardToValue('2')).toBe(2);
    });
  });

  describe('calculateTrueCount', () => {
    test('should calculate true count correctly', () => {
      // With 2 decks remaining, running count of +4 should be true count of +2
      expect(calculateTrueCount(2)).toBe(2);
      // With 1 deck remaining, running count of +4 should be true count of +4
      expect(calculateTrueCount(1)).toBe(4);
      // With 4 decks remaining, running count of +4 should be true count of +1
      expect(calculateTrueCount(4)).toBe(1);
    });
  });

  describe('getCountClass', () => {
    test('should return correct class based on count', () => {
      expect(getCountClass(3)).toBe('positive');
      expect(getCountClass(-2)).toBe('negative');
      expect(getCountClass(0)).toBe('neutral');
    });
  });

  describe('isPair', () => {
    test('should correctly identify pairs', () => {
      expect(isPair(['A', 'A'])).toBe(true);
      expect(isPair(['10', '10'])).toBe(true);
      expect(isPair(['K', 'Q'])).toBe(false);
      expect(isPair(['A', 'K'])).toBe(false);
    });
  });

  describe('hasSoftAce', () => {
    test('should correctly identify soft aces', () => {
      expect(hasSoftAce(12)).toBe(true);  // A + A
      expect(hasSoftAce(17)).toBe(true);  // A + 6
      expect(hasSoftAce(21)).toBe(true);  // A + 10
      expect(hasSoftAce(10)).toBe(false); // 10
      expect(hasSoftAce(16)).toBe(false); // 10 + 6
    });
  });

  describe('translateAction', () => {
    test('should translate action codes to display text', () => {
      expect(translateAction('H')).toBe('Hit');
      expect(translateAction('S')).toBe('Stand');
      expect(translateAction('D')).toBe('Double Down');
      expect(translateAction('P')).toBe('Split');
      expect(translateAction('DH')).toBe('Double if possible, otherwise Hit');
      expect(translateAction('DS')).toBe('Double if possible, otherwise Stand');
      expect(translateAction('unknown')).toBe('Unknown Action');
    });
  });
});
