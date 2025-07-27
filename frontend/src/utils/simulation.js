/**
 * Simulation Utilities
 * 
 * This module contains utility functions for running Blackjack simulations,
 * including hand evaluation, strategy application, and result analysis.
 */

/**
 * Represents a standard 52-card deck
 * @type {Array<{rank: string, suit: string}>}
 */
const STANDARD_DECK = (() => {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  
  return deck;
})();

/**
 * Get the point value of a card for Blackjack
 * @param {string} rank - The rank of the card (A, 2-10, J, Q, K)
 * @returns {number} The point value of the card
 */
export const getCardValue = (rank) => {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank, 10);
};

/**
 * Calculate the best possible score for a hand (handles Aces as 1 or 11)
 * @param {Array<{rank: string, suit: string}>} hand - The hand to evaluate
 * @returns {number} The best possible score without busting
 */
export const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;
  
  // Calculate initial value and count aces
  for (const card of hand) {
    const cardValue = getCardValue(card.rank);
    value += cardValue;
    if (card.rank === 'A') aces++;
  }
  
  // Adjust for aces if needed
  while (value > 21 && aces > 0) {
    value -= 10; // Convert an ace from 11 to 1
    aces--;
  }
  
  return value;
};

/**
 * Check if a hand is a blackjack (A + 10-value card)
 * @param {Array<{rank: string, suit: string}>} hand - The hand to check
 * @returns {boolean} True if the hand is a blackjack
 */
export const isBlackjack = (hand) => {
  if (hand.length !== 2) return false;
  const values = hand.map(card => getCardValue(card.rank));
  return (values.includes(11) && values.includes(10));
};

/**
 * Check if a hand is a pair (two cards of the same rank)
 * @param {Array<{rank: string, suit: string}>} hand - The hand to check
 * @returns {boolean} True if the hand is a pair
 */
export const isPair = (hand) => {
  return hand.length === 2 && hand[0].rank === hand[1].rank;
};

/**
 * Check if a hand is soft (contains an Ace counted as 11)
 * @param {Array<{rank: string, suit: string}>} hand - The hand to check
 * @returns {boolean} True if the hand is soft
 */
export const isSoftHand = (hand) => {
  let value = 0;
  let hasAce = false;
  
  for (const card of hand) {
    const cardValue = getCardValue(card.rank);
    value += cardValue;
    if (card.rank === 'A') hasAce = true;
  }
  
  return hasAce && value <= 21;
};

/**
 * Create a shuffled deck with the specified number of standard decks
 * @param {number} numDecks - Number of standard decks to include (default: 6)
 * @returns {Array<{rank: string, suit: string}>} A shuffled deck
 */
export const createShuffledDeck = (numDecks = 6) => {
  // Create a deck with the specified number of standard decks
  const deck = [];
  for (let i = 0; i < numDecks; i++) {
    deck.push(...STANDARD_DECK);
  }
  
  // Fisher-Yates shuffle algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }
  
  return deck;
};

/**
 * Get the recommended action based on basic strategy
 * @param {Array<{rank: string, suit: string}>} playerHand - The player's hand
 * @param {string} dealerUpcard - The dealer's face-up card rank
 * @param {boolean} canDouble - Whether the player can double down
 * @param {boolean} canSplit - Whether the player can split
 * @returns {string} The recommended action ('H' for Hit, 'S' for Stand, 'D' for Double, 'P' for Split)
 */
export const getRecommendedAction = (playerHand, dealerUpcard, canDouble = true, canSplit = true) => {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = getCardValue(dealerUpcard);
  const isSoft = isSoftHand(playerHand);
  
  // Handle pairs (potential split)
  if (canSplit && isPair(playerHand)) {
    const rank = playerHand[0].rank;
    
    // Always split aces and 8s
    if (rank === 'A' || rank === '8') return 'P';
    
    // Never split 5s and 10s
    if (rank === '5' || rank === '10') return 'H';
    
    // Split 2s, 3s, and 7s against dealer 2-7
    if ((rank === '2' || rank === '3' || rank === '7') && dealerValue >= 2 && dealerValue <= 7) {
      return 'P';
    }
    
    // Split 4s against dealer 5-6
    if (rank === '4' && (dealerValue === 5 || dealerValue === 6)) {
      return 'P';
    }
    
    // Split 6s against dealer 2-6
    if (rank === '6' && dealerValue >= 2 && dealerValue <= 6) {
      return 'P';
    }
    
    // Split 9s against dealer 2-6, 8-9
    if (rank === '9' && (dealerValue >= 2 && dealerValue <= 6) || dealerValue === 8 || dealerValue === 9) {
      return 'P';
    }
  }
  
  // Handle soft hands (Ace + other card)
  if (isSoft) {
    const softValue = playerValue;
    
    // Soft 19-21: Always stand
    if (softValue >= 19) return 'S';
    
    // Soft 18: Double against 2-6, stand against 7-8, hit against 9-11
    if (softValue === 18) {
      if (dealerValue >= 2 && dealerValue <= 6) return canDouble ? 'D' : 'S';
      if (dealerValue === 7 || dealerValue === 8) return 'S';
      return 'H';
    }
    
    // Soft 17: Double against 3-6, otherwise hit
    if (softValue === 17) {
      return (dealerValue >= 3 && dealerValue <= 6 && canDouble) ? 'D' : 'H';
    }
    
    // Soft 15-16: Double against 4-6, otherwise hit
    if (softValue === 15 || softValue === 16) {
      return (dealerValue >= 4 && dealerValue <= 6 && canDouble) ? 'D' : 'H';
    }
    
    // Soft 13-14: Double against 5-6, otherwise hit
    if (softValue === 13 || softValue === 14) {
      return ((dealerValue === 5 || dealerValue === 6) && canDouble) ? 'D' : 'H';
    }
    
    // Soft 12: Hit
    return 'H';
  }
  
  // Handle hard hands (no Ace, or Ace counted as 1)
  if (playerValue >= 17) return 'S';
  if (playerValue >= 13) return dealerValue >= 2 && dealerValue <= 6 ? 'S' : 'H';
  if (playerValue === 12) return dealerValue >= 4 && dealerValue <= 6 ? 'S' : 'H';
  
  // 11: Double if possible, otherwise hit
  if (playerValue === 11) return canDouble ? 'D' : 'H';
  
  // 10: Double against 2-9 if possible, otherwise hit
  if (playerValue === 10) {
    return (dealerValue >= 2 && dealerValue <= 9 && canDouble) ? 'D' : 'H';
  }
  
  // 9: Double against 3-6 if possible, otherwise hit
  if (playerValue === 9) {
    return (dealerValue >= 3 && dealerValue <= 6 && canDouble) ? 'D' : 'H';
  }
  
  // 8 or less: Always hit
  return 'H';
};

/**
 * Simulate playing a single hand of Blackjack
 * @param {Array<{rank: string, suit: string}>} deck - The deck to draw from
 * @param {number} currentIndex - Current index in the deck
 * @param {Array<{rank: string, suit: string}>} playerHand - Player's initial hand
 * @param {string} dealerUpcard - Dealer's face-up card
 * @param {Function} strategyFn - Function that determines the player's action
 * @returns {Object} Results of the hand simulation
 */
export const simulateHand = (deck, currentIndex, playerHand, dealerUpcard, strategyFn) => {
  // Clone the deck and hands to avoid modifying the originals
  const deckCopy = [...deck];
  const playerHandCopy = [...playerHand];
  let dealerHand = [{ rank: dealerUpcard, suit: 'H' }]; // Suit doesn't matter for simulation
  
  // Deal initial cards
  playerHandCopy.push(drawCard(deckCopy, currentIndex++));
  dealerHand.push(drawCard(deckCopy, currentIndex++));
  
  // Check for player blackjack
  if (isBlackjack(playerHandCopy)) {
    // Dealer checks for blackjack
    const dealerHasBlackjack = isBlackjack(dealerHand);
    return {
      result: dealerHasBlackjack ? 'push' : 'blackjack',
      playerHand: playerHandCopy,
      dealerHand,
      finalDeckIndex: currentIndex,
      actions: ['deal']
    };
  }
  
  // Player's turn
  const playerActions = [];
  let playerBusted = false;
  
  while (true) {
    const action = strategyFn(playerHandCopy, dealerUpcard);
    playerActions.push(action);
    
    if (action === 'S') {
      break; // Player stands
    }
    
    if (action === 'D') {
      // Double down - take one more card and stand
      playerHandCopy.push(drawCard(deckCopy, currentIndex++));
      playerActions.push('hit');
      break;
    }
    
    if (action === 'P') {
      // Split - for simplicity, we'll just hit for now
      // In a full implementation, we'd need to handle the split
      playerHandCopy.push(drawCard(deckCopy, currentIndex++));
      playerActions.push('split');
    }
    
    // Hit - take another card
    playerHandCopy.push(drawCard(deckCopy, currentIndex++));
    playerActions.push('hit');
    
    // Check for bust
    if (calculateHandValue(playerHandCopy) > 21) {
      playerBusted = true;
      break;
    }
  }
  
  // If player busted, game over
  if (playerBusted) {
    return {
      result: 'lose',
      playerHand: playerHandCopy,
      dealerHand,
      finalDeckIndex: currentIndex,
      actions: playerActions
    };
  }
  
  // Dealer's turn
  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(drawCard(deckCopy, currentIndex++));
  }
  
  const playerValue = calculateHandValue(playerHandCopy);
  const dealerValue = calculateHandValue(dealerHand);
  
  // Determine the result
  let result;
  if (dealerValue > 21) {
    result = 'win'; // Dealer busts
  } else if (dealerValue > playerValue) {
    result = 'lose';
  } else if (dealerValue < playerValue) {
    result = 'win';
  } else {
    result = 'push'; // Tie
  }
  
  return {
    result,
    playerHand: playerHandCopy,
    dealerHand,
    finalDeckIndex: currentIndex,
    actions: playerActions
  };
};

/**
 * Draw a card from the deck
 * @param {Array<{rank: string, suit: string}>} deck - The deck to draw from
 * @param {number} index - The current index in the deck
 * @returns {{rank: string, suit: string}} The drawn card
 */
const drawCard = (deck, index) => {
  if (index >= deck.length) {
    // If we've gone through the deck, reshuffle (for simulation purposes)
    // In a real game, this would be handled by the dealer
    return {
      rank: deck[Math.floor(Math.random() * deck.length)].rank,
      suit: 'H' // Suit doesn't matter for simulation
    };
  }
  return deck[index];
};

/**
 * Calculate statistics from simulation results
 * @param {Array<Object>} results - Array of hand results
 * @returns {Object} Statistics including win rate, loss rate, push rate, etc.
 */
export const calculateStatistics = (results) => {
  const stats = {
    totalHands: results.length,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    winRate: 0,
    lossRate: 0,
    pushRate: 0,
    blackjackRate: 0,
    netUnits: 0,
    averageWin: 0,
    averageLoss: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    winStreak: 0,
    lossStreak: 0,
    currentStreak: 0,
    currentStreakType: null
  };
  
  if (results.length === 0) return stats;
  
  // Calculate basic stats
  for (const result of results) {
    if (result.result === 'blackjack') {
      stats.wins++;
      stats.blackjacks++;
      stats.netUnits += 1.5; // Blackjack typically pays 3:2
    } else if (result.result === 'win') {
      stats.wins++;
      stats.netUnits += 1;
    } else if (result.result === 'lose') {
      stats.losses++;
      stats.netUnits -= 1;
    } else if (result.result === 'push') {
      stats.pushes++;
    }
    
    // Update streaks
    if (result.result === 'win' || result.result === 'blackjack') {
      if (stats.currentStreakType === 'win') {
        stats.currentStreak++;
      } else {
        stats.currentStreak = 1;
        stats.currentStreakType = 'win';
      }
      stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.currentStreak);
    } else if (result.result === 'lose') {
      if (stats.currentStreakType === 'lose') {
        stats.currentStreak++;
      } else {
        stats.currentStreak = 1;
        stats.currentStreakType = 'lose';
      }
      stats.maxLossStreak = Math.max(stats.maxLossStreak, stats.currentStreak);
    } else {
      stats.currentStreak = 0;
      stats.currentStreakType = null;
    }
  }
  
  // Calculate rates
  stats.winRate = (stats.wins / stats.totalHands) * 100;
  stats.lossRate = (stats.losses / stats.totalHands) * 100;
  stats.pushRate = (stats.pushes / stats.totalHands) * 100;
  stats.blackjackRate = (stats.blackjacks / stats.totalHands) * 100;
  
  // Calculate averages
  stats.averageWin = stats.wins > 0 ? (stats.netUnits / stats.wins) : 0;
  stats.averageLoss = stats.losses > 0 ? (Math.abs(stats.netUnits) / stats.losses) : 0;
  
  return stats;
};

/**
 * Format a card for display
 * @param {{rank: string, suit: string}} card - The card to format
 * @returns {string} Formatted card string (e.g., "A♥", "10♣")
 */
export const formatCard = (card) => {
  if (!card) return '';
  
  const suitSymbols = {
    'H': '♥',
    'D': '♦',
    'C': '♣',
    'S': '♠'
  };
  
  return `${card.rank}${suitSymbols[card.suit] || card.suit}`;
};

/**
 * Format a hand for display
 * @param {Array<{rank: string, suit: string}>} hand - The hand to format
 * @returns {string} Formatted hand string (e.g., "A♥ 10♣")
 */
export const formatHand = (hand) => {
  return hand.map(formatCard).join(' ');
};

export default {
  getCardValue,
  calculateHandValue,
  isBlackjack,
  isPair,
  isSoftHand,
  createShuffledDeck,
  getRecommendedAction,
  simulateHand,
  calculateStatistics,
  formatCard,
  formatHand
};
