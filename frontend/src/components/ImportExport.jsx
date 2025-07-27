import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiUpload, FiRotateCw, FiCheck, FiX } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';
import useImportExport from '../hooks/useImportExport';

const ImportExport = ({ className = '' }) => {
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const { exportGame, importGame, resetGame } = useImportExport();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await exportGame(`blackjack-save-${timestamp}`);
      
      setStatus({
        type: 'success',
        message: 'Game state exported successfully!'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to export game state'
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleImport = async () => {
    try {
      setStatus({ type: 'loading', message: 'Importing game state...' });
      
      // This will trigger the file input and handle the import
      importGame();
      
      // The actual import happens in the file input's change handler
      // We'll show a success message there if needed
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to import game state'
      });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleReset = () => {
    resetGame();
    setStatus({
      type: 'info',
      message: 'Game has been reset to initial state'
    });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return <FiCheck className="text-green-500" />;
      case 'error':
        return <FiX className="text-red-500" />;
      case 'loading':
        return <LoadingSpinner size="sm" />;
      case 'info':
        return null;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'loading':
        return 'text-blue-500';
      case 'info':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-colors
            ${isExporting 
              ? 'bg-blue-700 text-white cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'}
          `}
          title="Export current game state"
        >
          <FiDownload className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={handleImport}
          disabled={status.type === 'loading'}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-colors
            ${status.type === 'loading' 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'}
          `}
          title="Import saved game state"
        >
          <FiUpload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={handleReset}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-colors
            bg-red-600 hover:bg-red-700 text-white
          `}
          title="Reset current game"
        >
          <FiRotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {status.message && (
        <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

ImportExport.propTypes = {
  className: PropTypes.string
};

export default ImportExport;
