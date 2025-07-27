import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cards: [],
  runningCount: 0,
  decksRemaining: 6,
  selectedSystem: 'HILO',
  trueCount: 0,
  betRecommendation: { text: 'Minimum Bet', color: 'text-gray-300' },
  isLoading: false,
  error: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addCard: (state, action) => {
      const { card, value } = action.payload;
      state.cards.push({ card, value });
      state.runningCount += value;
    },
    removeLastCard: (state) => {
      if (state.cards.length > 0) {
        const lastCard = state.cards[state.cards.length - 1];
        state.cards.pop();
        state.runningCount -= lastCard.value;
      }
    },
    resetGame: (state) => {
      state.cards = [];
      state.runningCount = 0;
      state.trueCount = 0;
      state.betRecommendation = { text: 'Minimum Bet', color: 'text-gray-300' };
    },
    updateTrueCount: (state, action) => {
      state.trueCount = action.payload;
    },
    updateBetRecommendation: (state, action) => {
      state.betRecommendation = action.payload;
    },
    setSelectedSystem: (state, action) => {
      state.selectedSystem = action.payload;
    },
    setDecksRemaining: (state, action) => {
      state.decksRemaining = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  addCard,
  removeLastCard,
  resetGame,
  updateTrueCount,
  updateBetRecommendation,
  setSelectedSystem,
  setDecksRemaining,
  setLoading,
  setError
} = gameSlice.actions;

export default gameSlice.reducer;
