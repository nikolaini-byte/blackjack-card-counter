import {
  getCardValue,
  calculateHandValue,
  isBlackjack,
  isPair,
  isSoftHand,
  createShuffledDeck,
  getRecommendedAction,
  simulateHand,
  calculateStatistics
} from '../simulation';

describe('simulation utilities', () => {
  describe('getCardValue', () => {
    it('returns correct values for number cards', () => {
      expect(getCardValue('2')).toBe(2);
      expect(getCardValue('5')).toBe(5);
      expect(getCardValue('9')).toBe(9);
    });

    it('returns 10 for face cards', () => {
      expect(getCardValue('10')).toBe(10);
      expect(getCardValue('J')).toBe(10);
      expect(getCardValue('Q')).toBe(10);
      expect(getCardValue('K')).toBe(10);
    });

    it('returns 11 for Ace', () => {
      expect(getCardValue('A')).toBe(11);
    });
  });

  describe('calculateHandValue', () => {
    it('calculates value for simple hands', () => {
      expect(calculateHandValue([{ rank: '2', suit: 'H' }, { rank: '3', suit: 'D' }])).toBe(5);
      expect(calculateHandValue([{ rank: 'J', suit: 'H' }, { rank: 'Q', suit: 'D' }])).toBe(20);
    });

    it('handles Aces correctly', () => {
      // Ace as 11
      expect(calculateHandValue([{ rank: 'A', suit: 'H' }, { rank: '6', suit: 'D' }])).toBe(17);
      
      // Ace as 1 to avoid bust
      expect(calculateHandValue([
        { rank: 'A', suit: 'H' },
        { rank: '6', suit: 'D' },
        { rank: '9', suit: 'C' }
      ])).toBe(16);
      
      // Multiple Aces
      expect(calculateHandValue([
        { rank: 'A', suit: 'H' },
        { rank: 'A', suit: 'D' },
        { rank: '8', suit: 'C' }
      ])).toBe(20);
    });
  });

  describe('isBlackjack', () => {
    it('returns true for blackjack hands', () => {
      expect(isBlackjack([
        { rank: 'A', suit: 'H' },
        { rank: 'K', suit: 'D' }
      ])).toBe(true);
      
      expect(isBlackjack([
        { rank: 'A', suit: 'H' },
        { rank: '10', suit: 'D' }
      ])).toBe(true);
    });

    it('returns false for non-blackjack hands', () => {
      expect(isBlackjack([
        { rank: 'A', suit: 'H' },
        { rank: '9', suit: 'D' }
      ])).toBe(false);
      
      expect(isBlackjack([
        { rank: '10', suit: 'H' },
        { rank: '10', suit: 'D' }
      ])).toBe(false);
      
      expect(isBlackjack([
        { rank: 'A', suit: 'H' },
        { rank: '5', suit: 'D' },
        { rank: '5', suit: 'C' }
      ])).toBe(false);
    });
  });

  describe('isPair', () => {
    it('returns true for pairs', () => {
      expect(isPair([
        { rank: '8', suit: 'H' },
        { rank: '8', suit: 'D' }
      ])).toBe(true);
      
      expect(isPair([
        { rank: 'A', suit: 'H' },
        { rank: 'A', suit: 'D' }
      ])).toBe(true);
    });

    it('returns false for non-pairs', () => {
      expect(isPair([
        { rank: '8', suit: 'H' },
        { rank: '9', suit: 'D' }
      ])).toBe(false);
      
      expect(isPair([
        { rank: '8', suit: 'H' },
        { rank: '8', suit: 'D' },
        { rank: '8', suit: 'C' }
      ])).toBe(false);
    });
  });

  describe('isSoftHand', () => {
    it('returns true for soft hands', () => {
      expect(isSoftHand([
        { rank: 'A', suit: 'H' },
        { rank: '6', suit: 'D' }
      ])).toBe(true);
      
      expect(isSoftHand([
        { rank: 'A', suit: 'H' },
        { rank: 'A', suit: 'D' },
        { rank: '9', suit: 'C' }
      ])).toBe(true);
    });

    it('returns false for hard hands', () => {
      expect(isSoftHand([
        { rank: 'A', suit: 'H' },
        { rank: '6', suit: 'D' },
        { rank: '9', suit: 'C' }
      ])).toBe(false);
      
      expect(isSoftHand([
        { rank: '10', suit: 'H' },
        { rank: '6', suit: 'D' }
      ])).toBe(false);
    });
  });

  describe('createShuffledDeck', () => {
    it('creates a deck with the correct number of cards', () => {
      const deck = createShuffledDeck(1);
      expect(deck).toHaveLength(52);
      
      const sixDeck = createShuffledDeck(6);
      expect(sixDeck).toHaveLength(6 * 52);
    });
    
    it('creates a shuffled deck', () => {
      // This test might occasionally fail due to randomness, but it's very unlikely
      const deck1 = createShuffledDeck(1);
      const deck2 = createShuffledDeck(1);
      
      // Check if the decks are different (shuffled)
      let different = false;
      for (let i = 0; i < deck1.length; i++) {
        if (deck1[i].rank !== deck2[i].rank || deck1[i].suit !== deck2[i].suit) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });
  });

  describe('getRecommendedAction', () => {
    // Test some basic strategy scenarios
    it('recommends to split aces and 8s', () => {
      const aces = [{ rank: 'A', suit: 'H' }, { rank: 'A', suit: 'D' }];
      const eights = [{ rank: '8', suit: 'H' }, { rank: '8', suit: 'D' }];
      
      // Should always split aces and 8s
      for (let upcard = 2; upcard <= 11; upcard++) {
        expect(getRecommendedAction(aces, upcard, true, true)).toBe('P');
        expect(getRecommendedAction(eights, upcard, true, true)).toBe('P');
      }
    });
    
    it('recommends to stand on hard 17+', () => {
      const hard17 = [
        { rank: '10', suit: 'H' },
        { rank: '7', suit: 'D' }
      ];
      
      const hard19 = [
        { rank: '10', suit: 'H' },
        { rank: '9', suit: 'D' }
      ];
      
      // Should always stand on hard 17+
      for (let upcard = 2; upcard <= 11; upcard++) {
        expect(getRecommendedAction(hard17, upcard, true, true)).toBe('S');
        expect(getRecommendedAction(hard19, upcard, true, true)).toBe('S');
      }
    });
    
    it('recommends to hit on hard 11 or less', () => {
      const hard5 = [
        { rank: '2', suit: 'H' },
        { rank: '3', suit: 'D' }
      ];
      
      const hard11 = [
        { rank: '6', suit: 'H' },
        { rank: '5', suit: 'D' }
      ];
      
      // Should always hit on hard 11 or less
      for (let upcard = 2; upcard <= 11; upcard++) {
        expect(getRecommendedAction(hard5, upcard, true, true)).toBe('H');
        expect(getRecommendedAction(hard11, upcard, true, true)).toBe('H');
      }
    });
  });

  describe('simulateHand', () => {
    // This is a basic test as the function is complex and involves randomness
    it('completes a hand simulation', () => {
      // Create a predictable deck for testing
      const deck = [
        { rank: 'A', suit: 'H' },  // Player gets blackjack
        { rank: 'K', suit: 'D' },
        { rank: '10', suit: 'C' }, // Dealer gets 20
        { rank: '10', suit: 'S' },
        { rank: '2', suit: 'H' }   // Extra cards that shouldn't be used
      ];
      
      // Mock strategy function that always stands
      const strategyFn = () => 'S';
      
      const result = simulateHand(deck, 0, [], '10', strategyFn);
      
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('playerHand');
      expect(result).toHaveProperty('dealerHand');
      expect(result).toHaveProperty('finalDeckIndex');
      expect(result).toHaveProperty('actions');
      
      // Player should have blackjack
      expect(isBlackjack(result.playerHand)).toBe(true);
      
      // Dealer should have 20
      expect(calculateHandValue(result.dealerHand)).toBe(20);
      
      // Should have used 4 cards (2 for player, 2 for dealer)
      expect(result.finalDeckIndex).toBe(4);
    });
  });

  describe('calculateStatistics', () => {
    it('calculates correct statistics for a set of results', () => {
      const results = [
        { result: 'win' },
        { result: 'win' },
        { result: 'lose' },
        { result: 'push' },
        { result: 'blackjack' },
        { result: 'lose' },
        { result: 'win' },
        { result: 'push' },
        { result: 'lose' },
        { result: 'win' }
      ];
      
      const stats = calculateStatistics(results);
      
      expect(stats.totalHands).toBe(10);
      expect(stats.wins).toBe(4); // 3 wins + 1 blackjack
      expect(stats.losses).toBe(3);
      expect(stats.pushes).toBe(2);
      expect(stats.blackjacks).toBe(1);
      expect(stats.winRate).toBe(40); // 4 wins / 10 total
      expect(stats.lossRate).toBe(30); // 3 losses / 10 total
      expect(stats.pushRate).toBe(20); // 2 pushes / 10 total
      expect(stats.blackjackRate).toBe(10); // 1 blackjack / 10 total
      expect(stats.netUnits).toBe(1.5); // 4 wins (1 blackjack = 1.5) - 3 losses = 2.5 - 1 = 1.5
    });
    
    it('handles empty results', () => {
      const stats = calculateStatistics([]);
      
      expect(stats.totalHands).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.pushes).toBe(0);
      expect(stats.blackjacks).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.lossRate).toBe(0);
      expect(stats.pushRate).toBe(0);
      expect(stats.blackjackRate).toBe(0);
      expect(stats.netUnits).toBe(0);
    });
  });
});
