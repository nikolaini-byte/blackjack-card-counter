/**
 * Storage Utilities
 * 
 * This module provides functions for persisting and retrieving game state
 * from localStorage, with support for versioning, validation, and migration.
 */

// Current version of the storage format
const STORAGE_VERSION = '1.0.0';

// Storage keys
const STORAGE_KEYS = {
  GAME_STATE: 'blackjack_game_state',
  SETTINGS: 'blackjack_settings',
  VERSION: 'blackjack_storage_version'
};

/**
 * Get the current storage version
 * @returns {string} The current storage version
 */
export const getStorageVersion = () => {
  return localStorage.getItem(STORAGE_KEYS.VERSION) || '0.0.0';
};

/**
 * Set the storage version
 * @param {string} version - The version to set
 */
const setStorageVersion = (version) => {
  localStorage.setItem(STORAGE_KEYS.VERSION, version);
};

/**
 * Validate the stored game state
 * @param {Object} state - The state to validate
 * @returns {boolean} True if the state is valid
 */
const validateGameState = (state) => {
  if (!state || typeof state !== 'object') return false;
  
  // Validate required fields
  const requiredFields = ['cards', 'runningCount', 'trueCount', 'decksRemaining'];
  for (const field of requiredFields) {
    if (!(field in state)) return false;
  }
  
  // Validate cards array
  if (!Array.isArray(state.cards)) return false;
  
  // Validate counts are numbers
  if (typeof state.runningCount !== 'number' || 
      typeof state.trueCount !== 'number' ||
      typeof state.decksRemaining !== 'number') {
    return false;
  }
  
  return true;
};

/**
 * Validate the stored settings
 * @param {Object} settings - The settings to validate
 * @returns {boolean} True if the settings are valid
 */
const validateSettings = (settings) => {
  if (!settings || typeof settings !== 'object') return false;
  
  // Check for required settings with default values
  const defaultSettings = {
    theme: 'dark',
    soundEnabled: true,
    autoSave: true,
    animationSpeed: 1,
    countingSystem: 'HILO',
    deckCount: 6,
    showHelp: true
  };
  
  // All settings are optional, but if they exist they should be the correct type
  for (const [key, defaultValue] of Object.entries(defaultSettings)) {
    if (key in settings && typeof settings[key] !== typeof defaultValue) {
      return false;
    }
  }
  
  return true;
};

/**
 * Migrate stored data from an older version to the current version
 * @param {Object} data - The data to migrate
 * @param {string} fromVersion - The version to migrate from
 * @returns {Object} The migrated data
 */
const migrateData = (data, fromVersion) => {
  // If already at current version, return as is
  if (fromVersion === STORAGE_VERSION) {
    return data;
  }
  
  // Convert version strings to numbers for comparison
  const [major, minor, patch] = fromVersion.split('.').map(Number);
  const migratedData = { ...data };
  
  // Migration from versions before 1.0.0
  if (major < 1) {
    // Add any missing fields with default values
    if (!migratedData.settings) {
      migratedData.settings = {};
    }
    
    // Ensure all settings have default values if missing
    const defaultSettings = {
      theme: 'dark',
      soundEnabled: true,
      autoSave: true,
      animationSpeed: 1,
      countingSystem: 'HILO',
      deckCount: 6,
      showHelp: true
    };
    
    migratedData.settings = { ...defaultSettings, ...migratedData.settings };
    
    // Ensure game state has all required fields
    if (migratedData.game) {
      migratedData.game = {
        cards: migratedData.game.cards || [],
        runningCount: migratedData.game.runningCount || 0,
        trueCount: migratedData.game.trueCount || 0,
        decksRemaining: migratedData.game.decksRemaining || 6,
        selectedSystem: migratedData.game.selectedSystem || 'HILO',
        betRecommendation: migratedData.game.betRecommendation || { text: 'Minimum Bet', color: 'text-gray-300' }
      };
    }
  }
  
  // Future migrations would go here, incrementing version numbers as needed
  
  return migratedData;
};

/**
 * Save the game state to localStorage
 * @param {Object} state - The game state to save
 * @returns {boolean} True if the save was successful
 */
export const saveGameState = (state) => {
  try {
    if (!validateGameState(state)) {
      console.error('Invalid game state:', state);
      return false;
    }
    
    const data = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      game: state
    };
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
};

/**
 * Load the game state from localStorage
 * @returns {Object|null} The loaded game state, or null if not found or invalid
 */
export const loadGameState = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!savedData) return null;
    
    const parsedData = JSON.parse(savedData);
    const version = parsedData.version || '0.0.0';
    
    // Migrate data if needed
    const migratedData = migrateData(parsedData, version);
    
    // Validate the migrated data
    if (!migratedData.game || !validateGameState(migratedData.game)) {
      console.error('Invalid game state after migration:', migratedData);
      return null;
    }
    
    return migratedData.game;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

/**
 * Save settings to localStorage
 * @param {Object} settings - The settings to save
 * @returns {boolean} True if the save was successful
 */
export const saveSettings = (settings) => {
  try {
    if (!validateSettings(settings)) {
      console.error('Invalid settings:', settings);
      return false;
    }
    
    const data = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      settings
    };
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Load settings from localStorage
 * @returns {Object} The loaded settings, or default settings if not found or invalid
 */
export const loadSettings = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!savedData) return getDefaultSettings();
    
    const parsedData = JSON.parse(savedData);
    const version = parsedData.version || '0.0.0';
    
    // Migrate data if needed
    const migratedData = migrateData(parsedData, version);
    
    // Validate the migrated settings
    if (!migratedData.settings || !validateSettings(migratedData.settings)) {
      console.error('Invalid settings after migration:', migratedData);
      return getDefaultSettings();
    }
    
    return migratedData.settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
};

/**
 * Get default settings
 * @returns {Object} Default settings
 */
const getDefaultSettings = () => ({
  theme: 'dark',
  soundEnabled: true,
  autoSave: true,
  animationSpeed: 1,
  countingSystem: 'HILO',
  deckCount: 6,
  showHelp: true
});

/**
 * Clear all stored data
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Export all data as a JSON string
 * @returns {string} JSON string containing all data
 */
export const exportData = () => {
  try {
    const data = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      game: loadGameState(),
      settings: loadSettings()
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

/**
 * Import data from a JSON string
 * @param {string} jsonString - The JSON string to import
 * @returns {boolean} True if the import was successful
 */
export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate the imported data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    // Migrate data if needed
    const version = data.version || '0.0.0';
    const migratedData = migrateData(data, version);
    
    // Save the imported data
    if (migratedData.game) {
      saveGameState(migratedData.game);
    }
    
    if (migratedData.settings) {
      saveSettings(migratedData.settings);
    }
    
    // Update the storage version
    setStorageVersion(STORAGE_VERSION);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export default {
  getStorageVersion,
  saveGameState,
  loadGameState,
  saveSettings,
  loadSettings,
  clearAllData,
  exportData,
  importData
};
