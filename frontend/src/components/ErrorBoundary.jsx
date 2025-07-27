import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong
            </h2>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6">
                <p className="text-red-300 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                <details className="text-xs text-gray-300">
                  <summary className="cursor-pointer mb-2">
                    View component stack
                  </summary>
                  <pre className="bg-black/50 p-3 rounded overflow-x-auto">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Reload Page
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-red-900/50">
              <p className="text-sm text-gray-400">
                If the problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
