/**
 * Counting Systems for Card Counting Trainer
 * 
 * Each system defines the point values for cards in a blackjack deck
 * and includes metadata about the system.
 */

export const COUNTING_SYSTEMS = {
  HILO: {
    id: 'HILO',
    name: 'Hi-Lo',
    description: 'The most popular balanced counting system. Easy to learn and effective.',
    cardValues: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
    },
    balanced: true,
    bettingCorrelation: 0.97,
    playingEfficiency: 0.51
  },
  KO: {
    id: 'KO',
    name: 'Knock-Out (KO)',
    description: 'An unbalanced system that doesn\'t require true count conversion. Easier for beginners.',
    cardValues: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 1, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
    },
    balanced: false,
    bettingCorrelation: 0.88,
    playingEfficiency: 0.61,
    keyAdvantage: -4  // Key count per deck where advantage shifts
  },
  OMEGA_II: {
    id: 'OMEGA_II',
    name: 'Omega II',
    description: 'A more advanced balanced system with higher playing efficiency than Hi-Lo.',
    cardValues: {
      '2': 1, '3': 1, '4': 2, '5': 2, '6': 2,
      '7': 1, '8': 0, '9': -1,
      '10': -2, 'J': -2, 'Q': -2, 'K': -2, 'A': 0
    },
    balanced: true,
    bettingCorrelation: 0.92,
    playingEfficiency: 0.55
  }
};

/**
 * Get bet recommendation based on true count and counting system
 */
export const getBetRecommendation = (trueCount, systemId) => {
  const system = COUNTING_SYSTEMS[systemId];
  
  if (systemId === 'KO') {
    // KO uses running count directly for betting
    if (trueCount >= 5) return { text: 'Max Bet', color: 'text-green-400' };
    if (trueCount >= 3) return { text: 'High Bet', color: 'text-blue-400' };
    if (trueCount >= 1) return { text: 'Moderate Bet', color: 'text-yellow-400' };
    return { text: 'Minimum Bet', color: 'text-gray-300' };
  }
  
  // For balanced systems (Hi-Lo, Omega II)
  if (trueCount >= 5) return { text: 'Max Bet', color: 'text-green-400' };
  if (trueCount >= 3) return { text: 'High Bet', color: 'text-blue-400' };
  if (trueCount >= 1) return { text: 'Moderate Bet', color: 'text-yellow-400' };
  if (trueCount >= 0) return { text: 'Minimum Bet', color: 'text-gray-300' };
  return { text: 'Minimum or Leave', color: 'text-red-400' };
};

/**
 * Calculate true count based on running count and decks remaining
 * Handles both balanced and unbalanced systems
 * @param {number} runningCount - The current running count
 * @param {number} decksRemaining - Number of decks remaining in the shoe
 * @param {string} [systemId='HILO'] - The ID of the counting system to use (defaults to HILO)
 * @returns {number} The calculated true count
 */
export const calculateTrueCount = (runningCount, decksRemaining, systemId = 'HILO') => {
  // Default to HILO if systemId is not provided or invalid
  const system = COUNTING_SYSTEMS[systemId] || COUNTING_SYSTEMS.HILO;
  
  // If decksRemaining is invalid, return running count as fallback
  if (typeof decksRemaining !== 'number' || decksRemaining <= 0) {
    return runningCount;
  }
  
  // For unbalanced systems like KO, we don't convert to true count
  if (system && system.balanced === false) {
    return runningCount;
  }
  
  // For balanced systems, calculate true count
  const trueCount = runningCount / decksRemaining;
  return Math.round(trueCount * 10) / 10; // Round to 1 decimal
};
