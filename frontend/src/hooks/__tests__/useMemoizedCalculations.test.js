import { renderHook, act } from '@testing-library/react-hooks';
import { useMemoizedCalculations } from '../useMemoizedCalculations';
import { calculateHandValue } from '../../utils/simulation';

// Mock the simulation utilities
jest.mock('../../utils/simulation', () => ({
  calculateHandValue: jest.fn(),
  isBlackjack: jest.fn(),
  isSoftHand: jest.fn()
}));

describe('useMemoizedCalculations', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    calculateHandValue.mockImplementation(() => 0);
    require('../../utils/simulation').isBlackjack.mockImplementation(() => false);
    require('../../utils/simulation').isSoftHand.mockImplementation(() => false);
  });

  it('returns initial values when no cards are provided', () => {
    const { result } = renderHook(() => useMemoizedCalculations([], 'HILO'));
    
    expect(result.current).toEqual({
      runningCount: 0,
      trueCount: 0,
      handValue: 0,
      isBlackjack: false,
      isSoft: false,
      betRecommendation: expect.objectContaining({
        text: expect.any(String),
        color: expect.any(String),
        unit: expect.any(String),
        multiplier: expect.any(Number)
      }),
      getCardCountValue: expect.any(Function)
    });
  });

  it('calculates running count correctly for Hi-Lo system', () => {
    const cards = [
      { rank: 'A', suit: 'H' },  // -1
      { rank: 'K', suit: 'D' },  // -1
      { rank: '2', suit: 'C' },  // +1
      { rank: '7', suit: 'S' },  // 0
      { rank: '10', suit: 'H' }  // -1
    ];
    
    const { result } = renderHook(() => useMemoizedCalculations(cards, 'HILO'));
    
    // -1 -1 +1 +0 -1 = -2
    expect(result.current.runningCount).toBe(-2);
  });

  it('calculates true count based on running count and decks remaining', () => {
    const cards = [
      { rank: 'A', suit: 'H' },  // -1
      { rank: 'K', suit: 'D' },  // -1
      { rank: '2', suit: 'C' },  // +1
      { rank: '7', suit: 'S' },  // 0
      { rank: '10', suit: 'H' }  // -1
    ];
    
    // Mock calculateHandValue to return a fixed value for testing
    calculateHandValue.mockImplementation(() => 15);
    
    const { result } = renderHook(() => useMemoizedCalculations(cards, 'HILO'));
    
    // With 5 cards used, we estimate decks remaining as:
    // 6 (total decks) - (5/52) ≈ 5.9 decks remaining
    // Running count is -2
    // True count = -2 / 5.9 ≈ -0.34
    expect(result.current.trueCount).toBeCloseTo(-0.34);
  });

  it('provides correct bet recommendation based on true count', () => {
    // Test with different true counts
    const testCases = [
      { trueCount: 5.5, expected: { text: 'Maximum Bet', color: 'text-green-500', unit: '10+ units', multiplier: 10 } },
      { trueCount: 4, expected: { text: 'High Bet', color: 'text-green-400', unit: '5-9 units', multiplier: 5 } },
      { trueCount: 2, expected: { text: 'Moderate Bet', color: 'text-blue-400', unit: '2-4 units', multiplier: 2 } },
      { trueCount: 0.5, expected: { text: 'Minimum Bet', color: 'text-gray-300', unit: '1 unit', multiplier: 1 } },
      { trueCount: -1, expected: { text: 'Minimum Bet or Leave', color: 'text-red-400', unit: '0-1 units', multiplier: 0 } }
    ];
    
    testCases.forEach(({ trueCount, expected }) => {
      // Mock the true count calculation
      const cards = Array.from({ length: 10 }, (_, i) => ({
        rank: i < 5 ? 'A' : '2',
        suit: 'H'
      }));
      
      // Mock calculateHandValue to control the true count
      calculateHandValue.mockImplementation(() => 15);
      
      // Mock the getCardCountValue function to control the running count
      const { result } = renderHook(() => useMemoizedCalculations(cards, 'HILO'));
      
      // Override the true count for this test case
      result.current.trueCount = trueCount;
      
      // Check the bet recommendation
      expect(result.current.betRecommendation).toMatchObject(expected);
    });
  });

  it('correctly identifies blackjack hands', () => {
    const cards = [
      { rank: 'A', suit: 'H' },
      { rank: 'K', suit: 'D' }
    ];
    
    // Mock isBlackjack to return true for this test
    require('../../utils/simulation').isBlackjack.mockImplementation(() => true);
    
    const { result } = renderHook(() => useMemoizedCalculations(cards, 'HILO'));
    
    expect(result.current.isBlackjack).toBe(true);
  });

  it('correctly identifies soft hands', () => {
    const cards = [
      { rank: 'A', suit: 'H' },
      { rank: '6', suit: 'D' }
    ];
    
    // Mock isSoftHand to return true for this test
    require('../../utils/simulation').isSoftHand.mockImplementation(() => true);
    
    const { result } = renderHook(() => useMemoizedCalculations(cards, 'HILO'));
    
    expect(result.current.isSoft).toBe(true);
  });

  it('provides correct card count values for different counting systems', () => {
    const { result } = renderHook(() => useMemoizedCalculations([], 'HILO'));
    
    // Test Hi-Lo system
    expect(result.current.getCardCountValue('2', 'HILO')).toBe(1);
    expect(result.current.getCardCountValue('7', 'HILO')).toBe(0);
    expect(result.current.getCardCountValue('10', 'HILO')).toBe(-1);
    expect(result.current.getCardCountValue('A', 'HILO')).toBe(-1);
    
    // Test KO system
    expect(result.current.getCardCountValue('2', 'KO')).toBe(1);
    expect(result.current.getCardCountValue('7', 'KO')).toBe(1);
    expect(result.current.getCardCountValue('8', 'KO')).toBe(0);
    expect(result.current.getCardCountValue('10', 'KO')).toBe(-1);
    
    // Test Omega II system
    expect(result.current.getCardCountValue('2', 'OMEGA_II')).toBe(1);
    expect(result.current.getCardCountValue('5', 'OMEGA_II')).toBe(2);
    expect(result.current.getCardCountValue('9', 'OMEGA_II')).toBe(-1);
    expect(result.current.getCardCountValue('10', 'OMEGA_II')).toBe(-2);
    expect(result.current.getCardCountValue('A', 'OMEGA_II')).toBe(0);
  });

  it('memoizes calculations to prevent unnecessary recalculations', () => {
    const cards = [
      { rank: 'A', suit: 'H' },
      { rank: 'K', suit: 'D' }
    ];
    
    // Initial render
    const { result, rerender } = renderHook(
      ({ cards, system }) => useMemoizedCalculations(cards, system),
      {
        initialProps: { cards, system: 'HILO' }
      }
    );
    
    // Get the initial values
    const firstResult = result.current;
    
    // Re-render with the same props
    rerender({ cards, system: 'HILO' });
    
    // The result should be the same object (memoized)
    expect(result.current).toBe(firstResult);
    
    // Change the counting system
    rerender({ cards, system: 'KO' });
    
    // The result should be a new object
    expect(result.current).not.toBe(firstResult);
    
    // The running count should be different for KO system
    expect(result.current.runningCount).not.toBe(firstResult.runningCount);
  });

  it('handles edge cases for card counting', () => {
    const { result } = renderHook(() => useMemoizedCalculations([], 'HILO'));
    
    // Test invalid rank
    expect(result.current.getCardCountValue('X', 'HILO')).toBe(0);
    
    // Test invalid counting system
    expect(result.current.getCardCountValue('A', 'INVALID_SYSTEM')).toBe(0);
  });

  it('updates calculations when cards change', () => {
    const initialCards = [
      { rank: 'A', suit: 'H' }  // -1
    ];
    
    const { result, rerender } = renderHook(
      ({ cards }) => useMemoizedCalculations(cards, 'HILO'),
      {
        initialProps: { cards: initialCards }
      }
    );
    
    // Initial running count should be -1
    expect(result.current.runningCount).toBe(-1);
    
    // Add a low card
    const updatedCards = [
      ...initialCards,
      { rank: '2', suit: 'C' }  // +1
    ];
    
    // Re-render with updated cards
    rerender({ cards: updatedCards });
    
    // Running count should now be 0 (-1 + 1)
    expect(result.current.runningCount).toBe(0);
  });
});
