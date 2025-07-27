import * as storage from '../storage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  describe('getStorageVersion', () => {
    it('returns the current storage version', () => {
      // Default version should be returned when no version is set
      expect(storage.getStorageVersion()).toBe('0.0.0');
      
      // Set a version and verify it's returned
      const testVersion = '1.2.3';
      window.localStorage.setItem('blackjack_storage_version', testVersion);
      expect(storage.getStorageVersion()).toBe(testVersion);
    });
  });

  describe('validateGameState', () => {
    it('validates correct game state', () => {
      const validState = {
        cards: [{ rank: 'A', suit: 'H' }],
        runningCount: 1,
        trueCount: 0.5,
        decksRemaining: 6,
        selectedSystem: 'HILO',
        betRecommendation: { text: 'Min', color: 'gray' }
      };
      
      expect(storage.validateGameState(validState)).toBe(true);
    });

    it('rejects invalid game state', () => {
      // Missing required fields
      expect(storage.validateGameState({})).toBe(false);
      
      // Invalid cards type
      expect(storage.validateGameState({
        cards: 'not an array',
        runningCount: 1,
        trueCount: 0.5,
        decksRemaining: 6
      })).toBe(false);
      
      // Invalid count types
      expect(storage.validateGameState({
        cards: [],
        runningCount: 'not a number',
        trueCount: 0.5,
        decksRemaining: 6
      })).toBe(false);
    });
  });

  describe('validateSettings', () => {
    it('validates correct settings', () => {
      const validSettings = {
        theme: 'dark',
        soundEnabled: true,
        autoSave: true,
        animationSpeed: 1,
        countingSystem: 'HILO',
        deckCount: 6,
        showHelp: true
      };
      
      expect(storage.validateSettings(validSettings)).toBe(true);
    });

    it('handles partial settings', () => {
      // Should be valid with only some settings provided
      expect(storage.validateSettings({ theme: 'dark' })).toBe(true);
      expect(storage.validateSettings({ soundEnabled: false })).toBe(true);
    });

    it('rejects invalid settings types', () => {
      // Invalid type for theme
      expect(storage.validateSettings({ theme: 123 })).toBe(false);
      
      // Invalid type for soundEnabled
      expect(storage.validateSettings({ soundEnabled: 'true' })).toBe(false);
    });
  });

  describe('migrateData', () => {
    it('returns current version data as is', () => {
      const currentData = {
        version: storage.STORAGE_VERSION,
        game: { test: 'data' },
        settings: { theme: 'dark' }
      };
      
      const migrated = storage.migrateData(currentData, storage.STORAGE_VERSION);
      expect(migrated).toEqual(currentData);
    });
    
    it('migrates from version 0.0.0 to current version', () => {
      const oldData = {
        version: '0.0.0',
        game: {
          cards: [{ rank: 'A', suit: 'H' }],
          runningCount: 1,
          trueCount: 0.5,
          decksRemaining: 6
        },
        settings: {
          theme: 'light'
        }
      };
      
      const migrated = storage.migrateData(oldData, '0.0.0');
      
      // Should have added default values
      expect(migrated.settings).toMatchObject({
        theme: 'light',
        soundEnabled: true,
        autoSave: true,
        animationSpeed: 1,
        countingSystem: 'HILO',
        deckCount: 6,
        showHelp: true
      });
      
      // Game state should be preserved
      expect(migrated.game.cards).toEqual(oldData.game.cards);
      expect(migrated.game.runningCount).toBe(1);
      expect(migrated.game.trueCount).toBe(0.5);
      expect(migrated.game.decksRemaining).toBe(6);
      
      // Should have updated version
      expect(migrated.version).toBe(storage.STORAGE_VERSION);
    });
  });

  describe('saveGameState and loadGameState', () => {
    it('saves and loads game state', () => {
      const gameState = {
        cards: [{ rank: 'A', suit: 'H' }],
        runningCount: 1,
        trueCount: 0.5,
        decksRemaining: 6,
        selectedSystem: 'HILO',
        betRecommendation: { text: 'Min', color: 'gray' }
      };
      
      // Save the game state
      const saveResult = storage.saveGameState(gameState);
      expect(saveResult).toBe(true);
      
      // Verify localStorage was called correctly
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'blackjack_game_state',
        expect.any(String)
      );
      
      // Load the game state
      const loadedState = storage.loadGameState();
      
      // Verify the loaded state matches the saved state
      expect(loadedState).toMatchObject(gameState);
      
      // Verify the version was set
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'blackjack_storage_version',
        storage.STORAGE_VERSION
      );
    });
    
    it('returns null for invalid game state', () => {
      // Save invalid game state directly to localStorage
      localStorage.setItem('blackjack_game_state', JSON.stringify({
        version: storage.STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        game: { invalid: 'data' } // Missing required fields
      }));
      
      // Should return null for invalid state
      expect(storage.loadGameState()).toBeNull();
    });
  });

  describe('saveSettings and loadSettings', () => {
    it('saves and loads settings', () => {
      const settings = {
        theme: 'dark',
        soundEnabled: false,
        autoSave: true,
        animationSpeed: 1.5,
        countingSystem: 'KO',
        deckCount: 8,
        showHelp: false
      };
      
      // Save the settings
      const saveResult = storage.saveSettings(settings);
      expect(saveResult).toBe(true);
      
      // Verify localStorage was called correctly
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'blackjack_settings',
        expect.any(String)
      );
      
      // Load the settings
      const loadedSettings = storage.loadSettings();
      
      // Verify the loaded settings match the saved settings
      expect(loadedSettings).toMatchObject(settings);
    });
    
    it('returns default settings when none are saved', () => {
      // Clear localStorage
      localStorage.clear();
      
      // Should return default settings
      const defaultSettings = storage.loadSettings();
      expect(defaultSettings).toMatchObject({
        theme: 'dark',
        soundEnabled: true,
        autoSave: true,
        animationSpeed: 1,
        countingSystem: 'HILO',
        deckCount: 6,
        showHelp: true
      });
    });
  });

  describe('clearAllData', () => {
    it('clears all stored data', () => {
      // Set some data
      localStorage.setItem('blackjack_game_state', 'test');
      localStorage.setItem('blackjack_settings', 'test');
      localStorage.setItem('blackjack_storage_version', '1.0.0');
      
      // Clear all data
      storage.clearAllData();
      
      // Verify all data was cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('blackjack_game_state');
      expect(localStorage.removeItem).toHaveBeenCalledWith('blackjack_settings');
      expect(localStorage.removeItem).toHaveBeenCalledWith('blackjack_storage_version');
    });
  });

  describe('exportData and importData', () => {
    it('exports and imports data correctly', () => {
      // Set up test data
      const gameState = {
        cards: [{ rank: 'A', suit: 'H' }],
        runningCount: 1,
        trueCount: 0.5,
        decksRemaining: 6,
        selectedSystem: 'HILO',
        betRecommendation: { text: 'Min', color: 'gray' }
      };
      
      const settings = {
        theme: 'dark',
        soundEnabled: false
      };
      
      // Save the data
      storage.saveGameState(gameState);
      storage.saveSettings(settings);
      
      // Export the data
      const exported = storage.exportData();
      expect(typeof exported).toBe('string');
      
      // Clear all data
      storage.clearAllData();
      
      // Import the data
      const importResult = storage.importData(exported);
      expect(importResult).toBe(true);
      
      // Verify the data was imported correctly
      const loadedGameState = storage.loadGameState();
      const loadedSettings = storage.loadSettings();
      
      expect(loadedGameState).toMatchObject(gameState);
      expect(loadedSettings).toMatchObject(settings);
    });
    
    it('returns false for invalid import data', () => {
      // Invalid JSON
      expect(storage.importData('invalid json')).toBe(false);
      
      // Invalid data structure
      expect(storage.importData(JSON.stringify({ test: 'data' }))).toBe(false);
    });
  });
});
