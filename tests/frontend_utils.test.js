/**
 * Test suite for frontend utility functions.
 */

// Import the utility functions we want to test
const {
  calculateHandValue,
  isPair,
  hasSoftAce,
  calculateTrueCount,
  getCountClass
} = require('../src/static/js/utils');

describe('Frontend Utility Functions', () => {
  describe('calculateHandValue', () => {
    test('should calculate correct hand value for regular cards', () => {
      expect(calculateHandValue(['2', '3'])).toBe(5);
      expect(calculateHandValue(['10', 'J'])).toBe(20);
      expect(calculateHandValue(['K', 'Q'])).toBe(20);
    });

    test('should handle aces correctly', () => {
      expect(calculateHandValue(['A', '9'])).toBe(20);
      expect(calculateHandValue(['A', 'A', '9'])).toBe(21);
      expect(calculateHandValue(['A', 'A', 'A', '8'])).toBe(21);
      expect(calculateHandValue(['A', 'A', 'A', 'A', 'A'])).toBe(15);
    });

    test('should handle empty or invalid inputs', () => {
      expect(calculateHandValue([])).toBe(0);
      expect(calculateHandValue(['invalid'])).toBe(0);
    });
  });

  describe('isPair', () => {
    test('should correctly identify pairs', () => {
      expect(isPair(16)).toBe(false);
      expect(isPair(20)).toBe(true);
      expect(isPair(2)).toBe(true);
    });
  });

  describe('hasSoftAce', () => {
    test('should detect soft aces', () => {
      expect(hasSoftAce(17)).toBe(true);
      expect(hasSoftAce(21)).toBe(true);
      expect(hasSoftAce(22)).toBe(false);
      expect(hasSoftAce(12)).toBe(true);
      expect(hasSoftAce(2)).toBe(false);
    });
  });

  describe('calculateTrueCount', () => {
    test('should calculate true count correctly', () => {
      expect(calculateTrueCount(4, 2)).toBe(2);
      expect(calculateTrueCount(-3, 1.5)).toBe(-2);
      expect(calculateTrueCount(0, 0.5)).toBe(0);
    });
  });

  describe('getCountClass', () => {
    test('should return correct CSS class based on count', () => {
      expect(getCountClass(3)).toBe('positive-count');
      expect(getCountClass(-2)).toBe('negative-count');
      expect(getCountClass(0)).toBe('neutral-count');
    });
  });
});
