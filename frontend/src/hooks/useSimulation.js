import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setError } from '../store/slices/gameSlice';

// Create a reusable worker instance
const createWorker = () => {
  if (typeof window !== 'undefined') {
    return new Worker(new URL('../workers/simulation.worker.js', import.meta.url));
  }
  return null;
};

export const useSimulation = () => {
  const [simulationResults, setSimulationResults] = useState(null);
  const [worker, setWorker] = useState(null);
  const dispatch = useDispatch();
  
  const { runningCount, decksRemaining, selectedSystem } = useSelector(
    (state) => state.game
  );

  // Initialize worker
  useEffect(() => {
    const workerInstance = createWorker();
    if (workerInstance) {
      workerInstance.onmessage = (event) => {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'SIMULATION_RESULT':
            setSimulationResults(payload);
            dispatch(setLoading(false));
            break;
          case 'SIMULATION_ERROR':
            dispatch(setError(payload));
            dispatch(setLoading(false));
            break;
          default:
            break;
        }
      };
      
      setWorker(workerInstance);
    }

    return () => {
      if (workerInstance) {
        workerInstance.terminate();
      }
    };
  }, [dispatch]);

  // Run simulation
  const runSimulation = useCallback((params) => {
    if (!worker) return;
    
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    // Add current game state to simulation params
    const simulationParams = {
      ...params,
      runningCount,
      decksRemaining,
      countingSystem: selectedSystem,
      timestamp: Date.now()
    };
    
    worker.postMessage({
      type: 'RUN_SIMULATION',
      payload: simulationParams
    });
    
  }, [worker, runningCount, decksRemaining, selectedSystem, dispatch]);

  // Cancel running simulation
  const cancelSimulation = useCallback(() => {
    if (worker) {
      worker.postMessage({ type: 'CANCEL_SIMULATION' });
      dispatch(setLoading(false));
    }
  }, [worker, dispatch]);

  return {
    simulationResults,
    runSimulation,
    cancelSimulation,
    isSimulating: useSelector((state) => state.game.isLoading)
  };
};

export default useSimulation;
