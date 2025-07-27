import { useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCards, 
  setRunningCount, 
  setDecksRemaining, 
  setSelectedSystem, 
  updateTrueCount, 
  updateBetRecommendation,
  setError
} from '../store/slices/gameSlice';
import { setTheme, setAnimationSpeed, toggleSound, toggleAutoSave } from '../store/slices/settingsSlice';
import { exportState, createImportInput } from '../utils/exportImport';

/**
 * Custom hook for handling import/export of game state
 * @returns {Object} - Import/export functions and state
 */
export const useImportExport = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const importInputRef = useRef(null);

  // Clean up the file input on unmount
  useEffect(() => {
    return () => {
      if (importInputRef.current) {
        importInputRef.current.cleanup?.();
      }
    };
  }, []);

  /**
   * Export the current game state to a file
   * @param {string} filename - Optional custom filename
   */
  const handleExport = useCallback((filename) => {
    try {
      exportState(state, filename);
    } catch (error) {
      console.error('Export failed:', error);
      dispatch(setError('Failed to export game state'));
    }
  }, [state, dispatch]);

  /**
   * Handle successful import of game state
   * @param {Object} importedState - The imported state
   */
  const handleImportSuccess = useCallback((importedState) => {
    try {
      const { game, settings } = importedState;
      
      // Update game state
      if (game) {
        dispatch(setCards(game.cards || []));
        dispatch(setRunningCount(game.runningCount || 0));
        dispatch(setDecksRemaining(game.decksRemaining || 6));
        dispatch(setSelectedSystem(game.selectedSystem || 'HILO'));
        dispatch(updateTrueCount(game.trueCount || 0));
        
        if (game.betRecommendation) {
          dispatch(updateBetRecommendation(game.betRecommendation));
        }
      }
      
      // Update settings
      if (settings) {
        if (settings.theme) dispatch(setTheme(settings.theme));
        if (settings.animationSpeed) dispatch(setAnimationSpeed(settings.animationSpeed));
        if (settings.soundEnabled !== undefined) dispatch(toggleSound(settings.soundEnabled));
        if (settings.autoSave !== undefined) dispatch(toggleAutoSave(settings.autoSave));
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      dispatch(setError('Failed to import game state'));
      return false;
    }
  }, [dispatch]);

  /**
   * Handle import error
   * @param {Error} error - The error that occurred during import
   */
  const handleImportError = useCallback((error) => {
    console.error('Import error:', error);
    dispatch(setError(error.message || 'Failed to import game state'));
  }, [dispatch]);

  /**
   * Trigger the file input for import
   */
  const triggerImport = useCallback(() => {
    if (!importInputRef.current) {
      importInputRef.current = createImportInput(
        handleImportSuccess,
        handleImportError
      );
    }
    importInputRef.current.open();
  }, [handleImportSuccess, handleImportError]);

  /**
   * Reset the game to initial state
   */
  const resetGame = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the current game? This cannot be undone.')) {
      dispatch(setCards([]));
      dispatch(setRunningCount(0));
      dispatch(updateTrueCount(0));
      dispatch(updateBetRecommendation({ text: 'Minimum Bet', color: 'text-gray-300' }));
    }
  }, [dispatch]);

  return {
    exportGame: handleExport,
    importGame: triggerImport,
    resetGame,
    currentState: state
  };
};

export default useImportExport;
