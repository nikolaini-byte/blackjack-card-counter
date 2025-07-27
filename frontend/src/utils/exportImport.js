/**
 * Game State Export/Import Utility
 * 
 * This module provides functions to export the current game state to a JSON string
 * and import it back, with versioning and validation.
 */

// Current version of the state format
const STATE_VERSION = '1.0.0';

/**
 * Validates the imported state object
 * @param {Object} state - The state to validate
 * @returns {Object} - The validated state or default state if invalid
 */
const validateState = (state) => {
  // Basic validation
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state format');
  }

  // Version check
  if (state.version !== STATE_VERSION) {
    // In the future, we can add migration logic here for different versions
    console.warn(`State version mismatch. Expected ${STATE_VERSION}, got ${state.version}`);
  }

  // Validate required fields with defaults
  const defaultState = {
    game: {
      cards: [],
      runningCount: 0,
      decksRemaining: 6,
      selectedSystem: 'HILO',
      trueCount: 0,
      betRecommendation: { text: 'Minimum Bet', color: 'text-gray-300' },
      isLoading: false,
      error: null
    },
    settings: {
      showHelp: false,
      showSystemInfo: false,
      theme: 'dark',
      autoSave: true,
      animationSpeed: 'normal',
      soundEnabled: true
    },
    version: STATE_VERSION
  };

  // Merge with defaults
  return {
    game: { ...defaultState.game, ...(state.game || {}) },
    settings: { ...defaultState.settings, ...(state.settings || {}) },
    version: state.version || STATE_VERSION,
    // Add any additional validation or transformation here
  };
};

/**
 * Exports the current Redux state to a JSON string
 * @param {Object} state - The Redux state to export
 * @returns {string} - JSON string of the state
 */
export const exportState = (state) => {
  try {
    const stateToExport = {
      game: {
        cards: state.game.cards,
        runningCount: state.game.runningCount,
        decksRemaining: state.game.decksRemaining,
        selectedSystem: state.game.selectedSystem,
        trueCount: state.game.trueCount,
        betRecommendation: state.game.betRecommendation
      },
      settings: { ...state.settings },
      version: STATE_VERSION,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(stateToExport, null, 2);
  } catch (error) {
    console.error('Error exporting state:', error);
    throw new Error('Failed to export game state');
  }
};

/**
 * Imports a state from a JSON string
 * @param {string} jsonString - The JSON string to import
 * @returns {Object} - The validated state object
 */
export const importState = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return validateState(parsed);
  } catch (error) {
    console.error('Error importing state:', error);
    throw new Error('Invalid game state file');
  }
};

/**
 * Downloads the current state as a file
 * @param {Object} state - The Redux state to download
 * @param {string} filename - The name of the file (without extension)
 */
export const downloadState = (state, filename = 'blackjack-save') => {
  try {
    const data = exportState(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (error) {
    console.error('Error downloading state:', error);
    throw error;
  }
};

/**
 * Handles file selection for import
 * @param {Event} event - The file input change event
 * @returns {Promise<Object>} - A promise that resolves with the imported state
 */
export const handleFileSelect = (event) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const state = importState(e.target.result);
        resolve(state);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Creates a file input element for importing state
 * @param {Function} onImport - Callback when import is successful
 * @param {Function} onError - Callback when import fails
 * @returns {Object} - The file input element and a function to trigger it
 */
export const createImportInput = (onImport, onError) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  
  input.onchange = async (event) => {
    try {
      const state = await handleFileSelect(event);
      onImport(state);
    } catch (error) {
      console.error('Import error:', error);
      onError?.(error);
    }
    
    // Reset the input to allow re-importing the same file
    input.value = '';
  };
  
  document.body.appendChild(input);
  
  return {
    element: input,
    open: () => input.click(),
    cleanup: () => {
      document.body.removeChild(input);
    }
  };
};

export default {
  exportState,
  importState,
  downloadState,
  handleFileSelect,
  createImportInput,
  STATE_VERSION
};
