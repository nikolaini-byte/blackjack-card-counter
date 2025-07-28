/**
 * Card utility functions for the Blackjack Card Counter
 */

import { CARD_RANKS, CARD_VALUES } from './cardConstants';

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
 * Get ARIA label for a card
 * @param {string} rank - The card rank
 * @param {string} source - Where the card is from ('player' or 'dealer')
 * @returns {string} Accessible label for the card
 */
export const getCardAriaLabel = (rank, source) => {
  const sourceText = source === 'player' ? 'Player' : 'Dealer';
  return `${rank} of ${sourceText}'s hand`;
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
export const calculateRunningCount = (cards = [], countingSystem) => {
  if (!countingSystem?.cardValues) return 0;
  
  return cards.reduce((sum, card) => {
    const val = countingSystem.cardValues[card.rank] || 0;
    return sum + (card.visible !== false ? val : 0);
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

/**
 * Calculate the value of a hand in blackjack
 * @param {Array} cards - Array of card objects
 * @returns {Object} Object containing hand value and whether it's a soft hand
 */
export const calculateHandValue = (cards = []) => {
  let sum = 0;
  let aces = 0;
  let isSoft = false;

  // First pass: count all non-ace cards
  cards.forEach(card => {
    if (card.visible === false) return; // Skip hidden cards
    
    if (card.rank === 'A') {
      aces++;
      sum += 11; // Count aces as 11 initially
    } else {
      sum += CARD_VALUES[card.rank] || 0;
    }
  });

  // Second pass: adjust for aces if needed
  while (sum > 21 && aces > 0) {
    sum -= 10; // Change an ace from 11 to 1
    aces--;
  }

  // A hand is soft if it contains an ace counted as 11
  isSoft = aces > 0 && sum <= 21;

  return { value: sum, isSoft };
};

/**
 * Generate a unique ID for a card
 * @returns {string} A unique ID
 */
export const generateCardId = () => {
  return `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get the count value of a card based on the current counting system
 * @param {string} rank - The card rank
 * @param {Object} countingSystem - The current counting system
 * @returns {number} The count value of the card
 */
export const getCardCountValue = (rank, countingSystem) => {
  if (!countingSystem?.cardValues) return 0;
  return countingSystem.cardValues[rank] || 0;
};
