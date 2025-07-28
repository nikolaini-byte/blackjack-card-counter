import { STORAGE_KEYS } from './cardConstants';

/**
 * Save data to localStorage
 * @param {string} key - The key under which to store the data
 * @param {*} data - The data to store (will be stringified)
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Load data from localStorage
 * @param {string} key - The key of the data to retrieve
 * @param {*} defaultValue - The default value to return if the key doesn't exist
 * @returns {*} The parsed data or the default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Save the current game state to localStorage
 * @param {Object} state - The current game state
 */
export const saveGameState = (state) => {
  const { cards, selectedSystem, decksRemaining } = state;
  
  // Only save visible cards to storage
  const visibleCards = cards.filter(card => card.visible !== false);
  
  saveToStorage(STORAGE_KEYS.cards, visibleCards);
  saveToStorage(STORAGE_KEYS.system, selectedSystem);
  saveToStorage(STORAGE_KEYS.decks, decksRemaining);
};

/**
 * Load the game state from localStorage
 * @returns {Object} The loaded game state
 */
export const loadGameState = () => {
  const cards = loadFromStorage(STORAGE_KEYS.cards, []);
  const selectedSystem = loadFromStorage(STORAGE_KEYS.system, 'hilo');
  const decksRemaining = loadFromStorage(STORAGE_KEYS.decks, 6);
  
  return { cards, selectedSystem, decksRemaining };
};

/**
 * Clear all game-related data from localStorage
 */
export const clearGameState = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};

/**
 * Get the initial state, loading from localStorage if available
 * @returns {Object} The initial application state
 */
export const getInitialState = () => {
  const savedState = loadGameState();
  
  return {
    cards: savedState.cards || [],
    selectedSystem: savedState.selectedSystem || 'hilo',
    decksRemaining: savedState.decksRemaining || 6,
    showHelp: false,
    showSystemInfo: false,
    error: null,
    isCalculating: false,
    simulationResult: null,
    betRec: { unit: '-', text: 'No recommendation' },
  };
};
