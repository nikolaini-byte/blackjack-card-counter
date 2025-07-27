import { useMemo } from 'react';
import { calculateHandValue, isBlackjack, isSoftHand } from '../utils/simulation';

/**
 * useMemoizedCalculations Hook
 * 
 * A custom hook that provides memoized calculations for Blackjack hands and counts.
 * This helps optimize performance by avoiding redundant calculations.
 */
const useMemoizedCalculations = (cards, selectedSystem = 'HILO') => {
  // Memoize the running count calculation
  const runningCount = useMemo(() => {
    if (!cards || !cards.length) return 0;
    
    return cards.reduce((count, card) => {
      return count + getCardCountValue(card.rank, selectedSystem);
    }, 0);
  }, [cards, selectedSystem]);
  
  // Memoize the true count calculation
  const trueCount = useMemo(() => {
    if (!cards || !cards.length) return 0;
    
    // Estimate decks remaining based on number of cards seen
    const totalDecks = 6; // Assuming 6-deck shoe
    const cardsPerDeck = 52;
    const cardsSeen = cards.length;
    const estimatedDecksRemaining = Math.max(0.5, totalDecks - (cardsSeen / cardsPerDeck));
    
    return (runningCount / estimatedDecksRemaining).toFixed(2);
  }, [runningCount, cards]);
  
  // Memoize the current hand value
  const handValue = useMemo(() => {
    if (!cards || !cards.length) return 0;
    return calculateHandValue(cards);
  }, [cards]);
  
  // Memoize whether the current hand is a blackjack
  const isBlackjackHand = useMemo(() => {
    if (!cards || cards.length !== 2) return false;
    return isBlackjack(cards);
  }, [cards]);
  
  // Memoize whether the current hand is soft
  const isSoft = useMemo(() => {
    if (!cards || !cards.length) return false;
    return isSoftHand(cards);
  }, [cards]);
  
  // Get the count value for a card based on the selected counting system
  const getCardCountValue = (rank, system) => {
    switch (system) {
      case 'HILO': // Hi-Lo system
        if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
        if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1;
        return 0;
        
      case 'KO': // Knock-Out system
        if (['2', '3', '4', '5', '6', '7'].includes(rank)) return 1;
        if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1;
        return 0;
        
      case 'OMEGA_II': // Omega II system
        if (['2', '3', '7'].includes(rank)) return 1;
        if (['4', '5', '6'].includes(rank)) return 2;
        if (['9'].includes(rank)) return -1;
        if (['10', 'J', 'Q', 'K'].includes(rank)) return -2;
        return 0; // Aces and 8s are 0 in Omega II
        
      default:
        return 0;
    }
  };
  
  // Get betting recommendation based on true count
  const getBetRecommendation = useMemo(() => {
    const tc = parseFloat(trueCount);
    
    if (tc >= 5) {
      return {
        text: 'Maximum Bet',
        color: 'text-green-500',
        unit: '10+ units',
        multiplier: 10
      };
    } else if (tc >= 3) {
      return {
        text: 'High Bet',
        color: 'text-green-400',
        unit: '5-9 units',
        multiplier: 5
      };
    } else if (tc >= 1) {
      return {
        text: 'Moderate Bet',
        color: 'text-blue-400',
        unit: '2-4 units',
        multiplier: 2
      };
    } else if (tc >= 0) {
      return {
        text: 'Minimum Bet',
        color: 'text-gray-300',
        unit: '1 unit',
        multiplier: 1
      };
    } else {
      return {
        text: 'Minimum Bet or Leave',
        color: 'text-red-400',
        unit: '0-1 units',
        multiplier: 0
      };
    }
  }, [trueCount]);
  
  return {
    runningCount,
    trueCount: parseFloat(trueCount),
    handValue,
    isBlackjack: isBlackjackHand,
    isSoft,
    betRecommendation: getBetRecommendation,
    getCardCountValue
  };
};

export default useMemoizedCalculations;
