/**
 * @fileoverview Utility functions for the Blackjack Card Counter application.
 * @module utils
 * @description Provides helper functions for card calculations, counting systems,
 * and other game-related utilities.
 */

/**
 * Represents a playing card value (e.g., 'A', '2', ..., '10', 'J', 'Q', 'K')
 * @typedef {('A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K')} CardValue
 */

/**
 * @typedef {Object} HandValue
 * @property {number} value - The total value of the hand
 * @property {boolean} isSoft - Whether the hand is soft (contains an ace counted as 11)
 */

/**
 * Calculate the total value of a hand of cards, accounting for aces.
 * @param {CardValue[]} cards - Array of card values (e.g., ['A', 'K', '2'])
 * @returns {HandValue} Object containing the total value and whether it's a soft hand
 * @throws {TypeError} If cards is not an array
 * @example
 * // Returns { value: 13, isSoft: false }
 * calculateHandValue(['K', '3']);
 * @example
 * // Returns { value: 17, isSoft: true }
 * calculateHandValue(['A', '6']);
 */
function calculateHandValue(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return { value: 0, isSoft: false };
  }
  
  let total = 0;
  let aces = 0;
  let isSoft = false;
  
  // First pass: count all cards with aces as 11
  for (const card of cards) {
    if (card === 'A') {
      aces++;
      total += 11;
      isSoft = true; // Tentatively soft until proven otherwise
    } else if (['J', 'Q', 'K'].includes(card)) {
      total += 10;
    } else {
      const value = parseInt(card, 10);
      if (!isNaN(value)) {
        total += value;
      }
    }
  }
  
  // Adjust for aces if needed
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
    
    // If we've converted all aces to 1, the hand is no longer soft
    if (aces === 0) {
      isSoft = false;
    }
  }
  
  return { value: total, isSoft };
}

/**
 * Check if a hand consists of a pair of cards with the same rank.
 * @param {CardValue[]} cards - Array of card values to check
 * @returns {boolean} True if the hand contains exactly two cards of the same rank
 * @example
 * // Returns true
 * isPair(['K', 'K']);
 * @example
 * // Returns false
 * isPair(['K', 'Q']);
 * @example
 * // Returns false (three of a kind is not a pair)
 * isPair(['5', '5', '5']);
 */
function isPair(cards) {
  if (!Array.isArray(cards) || cards.length !== 2) {
    return false;
  }
  
  // Convert 10 to T for consistent comparison (e.g., '10' becomes 'T')
  const normalizeCard = card => card === '10' ? 'T' : card;
  
  return normalizeCard(cards[0]) === normalizeCard(cards[1]);
}

/**
 * Check if a hand is soft (contains an ace counted as 11).
 * @param {CardValue[]} cards - Array of card values to check
 * @returns {boolean} True if the hand is soft (contains an ace counted as 11)
 * @example
 * // Returns true (Ace + 6 = 17, with Ace as 11)
 * hasSoftAce(['A', '6']);
 * @example
 * // Returns false (Ace + 10 = 21, but Ace is 1 to avoid busting)
 * hasSoftAce(['A', 'K', 'Q']);
 */
function hasSoftAce(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return false;
  }
  
  // If there's no ace, it can't be a soft hand
  if (!cards.includes('A')) {
    return false;
  }
  
  // Calculate the hand value with aces as 11 and see if any remain as 11
  let total = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card)) {
      total += 10;
    } else {
      total += parseInt(card, 10) || 0;
    }
  }
  
  // Adjust for aces if needed, but track if any ace is still 11
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  // If we still have aces counted as 11, it's a soft hand
  return aces > 0 && total <= 21;
}

/**
 * Calculate the true count for card counting.
 * The true count is the running count divided by the number of decks remaining.
 * @param {number} runningCount - The current running count (positive or negative)
 * @param {number} decksRemaining - Number of decks remaining in the shoe (must be > 0)
 * @returns {number} The true count, rounded to one decimal place
 * @throws {RangeError} If decksRemaining is less than or equal to 0
 * @example
 * // Returns 2.0 (running count 4 with 2 decks remaining)
 * calculateTrueCount(4, 2);
 * @example
 * // Returns -1.7 (running count -5 with 3 decks remaining)
 * calculateTrueCount(-5, 3);
 */
function calculateTrueCount(runningCount, decksRemaining) {
  if (decksRemaining <= 0) {
    throw new RangeError('decksRemaining must be greater than 0');
  }
  
  // Calculate true count with one decimal place precision
  const trueCount = runningCount / decksRemaining;
  return Math.round(trueCount * 10) / 10;
}

/**
 * Get the appropriate CSS class for displaying the count based on its value.
 * @param {number} count - The current count (positive, negative, or zero)
 * @returns {'positive-count'|'negative-count'|'neutral-count'} CSS class name
 * @example
 * // Returns 'positive-count'
 * getCountClass(5);
 * @example
 * // Returns 'negative-count'
 * getCountClass(-3);
 * @example
 * // Returns 'neutral-count'
 * getCountClass(0);
 */
function getCountClass(count) {
  if (typeof count !== 'number' || isNaN(count)) {
    return 'neutral-count';
  }
  
  if (count > 0) return 'positive-count';
  if (count < 0) return 'negative-count';
  return 'neutral-count';
}

// Export all utility functions
export {
  calculateHandValue,
  isPair,
  hasSoftAce,
  calculateTrueCount,
  getCountClass
};

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateHandValue,
    isPair,
    hasSoftAce,
    calculateTrueCount,
    getCountClass
  };
}
