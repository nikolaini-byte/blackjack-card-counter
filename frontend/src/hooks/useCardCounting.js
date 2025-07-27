import { useDispatch, useSelector } from 'react-redux';
import { 
  addCard as addCardAction, 
  removeLastCard as removeLastCardAction,
  updateTrueCount,
  updateBetRecommendation
} from '../store/slices/gameSlice';
import { COUNTING_SYSTEMS, calculateTrueCount, getBetRecommendation } from '../utils/countingSystems';

export const useCardCounting = () => {
  const dispatch = useDispatch();
  const { cards, runningCount, decksRemaining, selectedSystem } = useSelector(
    (state) => state.game
  );

  // Calculate derived state
  const usedDecks = (cards.length / 52).toFixed(2);
  const decksLeft = Math.max(0, decksRemaining - usedDecks).toFixed(2);

  // Handle card input
  const handleCardInput = (card) => {
    const upperCard = card.toUpperCase();
    const currentSystem = COUNTING_SYSTEMS[selectedSystem];
    
    if (currentSystem.cardValues[upperCard] !== undefined) {
      const value = currentSystem.cardValues[upperCard];
      dispatch(addCardAction({ card: upperCard, value }));
      
      // Update true count and bet recommendation after state update
      setTimeout(() => {
        const newTrueCount = calculateTrueCount(
          runningCount + value,
          decksRemaining - usedDecks,
          selectedSystem
        );
        
        const betRec = getBetRecommendation(newTrueCount, selectedSystem);
        
        dispatch(updateTrueCount(newTrueCount));
        dispatch(updateBetRecommendation(betRec));
      }, 0);
    }
  };

  // Handle removing last card
  const handleRemoveLastCard = () => {
    if (cards.length > 0) {
      const lastCard = cards[cards.length - 1];
      dispatch(removeLastCardAction());
      
      // Update true count and bet recommendation after state update
      setTimeout(() => {
        const newTrueCount = calculateTrueCount(
          runningCount - lastCard.value,
          decksRemaining - usedDecks,
          selectedSystem
        );
        
        const betRec = getBetRecommendation(newTrueCount, selectedSystem);
        
        dispatch(updateTrueCount(newTrueCount));
        dispatch(updateBetRecommendation(betRec));
      }, 0);
    }
  };

  // Calculate card statistics
  const getCardStats = () => {
    const stats = {
      low: 0,  // 2-6
      neutral: 0, // 7-9
      high: 0  // 10-A
    };

    cards.forEach(({ card }) => {
      if (['2', '3', '4', '5', '6'].includes(card)) {
        stats.low++;
      } else if (['7', '8', '9'].includes(card)) {
        stats.neutral++;
      } else {
        stats.high++;
      }
    });

    return stats;
  };

  return {
    cards,
    runningCount,
    decksRemaining,
    usedDecks,
    decksLeft,
    selectedSystem,
    handleCardInput,
    handleRemoveLastCard,
    getCardStats,
  };
};

export default useCardCounting;
