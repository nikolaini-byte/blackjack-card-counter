import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '../store/slices/gameSlice';

// Create a worker instance outside the component to maintain a single instance
const createWorker = () => {
  if (window.Worker) {
    return new Worker(new URL('../workers/simulation.worker.js', import.meta.url));
  }
  return null;
};

export const useSimulationWorker = () => {
  const [worker, setWorker] = useState(null);
  const [progress, setProgress] = useState(0);
  const [interimResults, setInterimResults] = useState(null);
  const workerRef = useRef(null);
  const dispatch = useDispatch();

  // Initialize worker on mount
  useEffect(() => {
    const workerInstance = createWorker();
    if (workerInstance) {
      workerRef.current = workerInstance;
      setWorker(workerInstance);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Set up message and error handlers
  useEffect(() => {
    if (!worker) return;

    const handleMessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'SIMULATION_PROGRESS':
          setProgress(payload.progress);
          setInterimResults(payload.currentResults);
          break;

        case 'SIMULATION_RESULT':
          setProgress(100);
          dispatch(setLoading(false));
          if (interimResults) {
            setInterimResults(null);
          }
          break;

        case 'SIMULATION_ERROR':
          console.error('Simulation error:', payload);
          dispatch(setError(payload));
          dispatch(setLoading(false));
          break;

        case 'SIMULATION_CANCELLED':
          console.log('Simulation cancelled');
          dispatch(setLoading(false));
          break;

        default:
          break;
      }
    };

    const handleError = (error) => {
      console.error('Worker error:', error);
      dispatch(setError('An error occurred during simulation'));
      dispatch(setLoading(false));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };
  }, [worker, dispatch, interimResults]);

  // Function to start a new simulation
  const runSimulation = useCallback((params) => {
    if (!workerRef.current) {
      console.error('Web Worker not supported');
      return;
    }

    try {
      dispatch(setLoading(true));
      setProgress(0);
      
      workerRef.current.postMessage({
        type: 'RUN_SIMULATION',
        payload: params
      });

      return new Promise((resolve, reject) => {
        const handleResult = (event) => {
          const { type, payload } = event.data;
          
          if (type === 'SIMULATION_RESULT') {
            workerRef.current.removeEventListener('message', handleResult);
            resolve(payload);
          } else if (type === 'SIMULATION_ERROR') {
            workerRef.current.removeEventListener('message', handleResult);
            reject(new Error(payload));
          }
        };

        workerRef.current.addEventListener('message', handleResult);
      });
    } catch (error) {
      console.error('Error running simulation:', error);
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return Promise.reject(error);
    }
  }, [dispatch]);

  // Function to cancel a running simulation
  const cancelSimulation = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CANCEL_SIMULATION' });
      dispatch(setLoading(false));
      setProgress(0);
      setInterimResults(null);
    }
  }, [dispatch]);

  return {
    runSimulation,
    cancelSimulation,
    progress,
    interimResults,
    isWorkerReady: !!worker
  };
};

export default useSimulationWorker;
