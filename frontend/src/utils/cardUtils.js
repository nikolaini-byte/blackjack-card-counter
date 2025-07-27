/**
 * Card utility functions for the Blackjack Card Counter
 */

// Valid card ranks
const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Get CSS classes for card buttons based on their value in the counting system
 * @param {number} value - The card's value in the counting system
 * @returns {string} Tailwind CSS classes
 */
export const getCardColorClass = (value) => {
  if (value > 0) return 'bg-green-700 hover:bg-green-600 text-white';
  if (value < 0) return 'bg-red-700 hover:bg-red-600 text-white';
  return 'bg-gray-700 hover:bg-gray-600 text-white';
};

/**
 * Validate if a card rank is valid
 * @param {string} rank - The card rank to validate
 * @returns {boolean} True if the rank is valid
 */
export const isValidCardRank = (rank) => CARD_RANKS.includes(rank);

/**
 * Calculate the running count based on cards and counting system
 * @param {Array} cards - Array of card objects
 * @param {Object} countingSystem - The counting system being used
 * @returns {number} The running count
 */
export const calculateRunningCount = (cards, countingSystem) => {
  return cards.reduce((sum, card) => {
    const val = countingSystem.cardValues[card.rank] || 0;
    return sum + (card.visible ? val : 0);
  }, 0);
};

/**
 * Calculate the true count based on running count and remaining decks
 * @param {number} runningCount - The current running count
 * @param {number} remainingDecks - Number of remaining decks
 * @param {boolean} isBalancedSystem - Whether the counting system is balanced
 * @returns {number} The true count
 */
export const calculateTrueCount = (runningCount, remainingDecks, isBalancedSystem) => {
  if (!isBalancedSystem || remainingDecks <= 0) return runningCount;
  return runningCount / remainingDecks;
};

export { CARD_RANKS };
