/**
 * @typedef {Object} ErrorBoundaryOptions
 * @property {boolean} [showDetails=true] - Whether to show error details in the UI
 * @property {string} [errorTitle='Something went wrong'] - Title to display for the error
 * @property {string} [retryButtonText='Try Again'] - Text for the retry button
 * @property {string} [errorDetailsLabel='Error details'] - Label for the error details section
 */

/**
 * ErrorBoundary component to catch JavaScript errors in child components.
 * Provides a fallback UI when an error occurs, allowing for graceful error handling
 * and recovery in the application.
 * 
 * @example
 * // Basic usage
 * const container = document.getElementById('app');
 * const errorBoundary = new ErrorBoundary(container, () => {
 *   // Your app rendering code here
 * });
 * 
 * // With custom options
 * const errorBoundary = new ErrorBoundary(container, renderApp, {
 *   errorTitle: 'Oops! Something broke',
 *   showDetails: process.env.NODE_ENV === 'development'
 * });
 * 
 * // Trigger a re-render
 * errorBoundary.render();
 */
class ErrorBoundary {
    /**
     * Creates an ErrorBoundary instance.
     * @param {HTMLElement} container - The DOM element where the error boundary will be rendered
     * @param {() => void} renderFunction - The function that renders the application UI
     * @param {ErrorBoundaryOptions} [options] - Configuration options for the error boundary
     * @throws {TypeError} If container is not a valid DOM element or renderFunction is not a function
     */
    constructor(container, renderFunction, options = {}) {
        // Validate inputs
        if (!(container instanceof HTMLElement)) {
            throw new TypeError('Container must be a valid DOM element');
        }
        if (typeof renderFunction !== 'function') {
            throw new TypeError('renderFunction must be a function');
        }

        /**
         * The container element where the error boundary will be rendered
         * @type {HTMLElement}
         * @private
         */
        this.container = container;

        /**
         * The function that renders the application UI
         * @type {() => void}
         * @private
         */
        this.renderFunction = renderFunction;

        /**
         * The error that was caught, if any
         * @type {Error|null}
         * @private
         */
        this.error = null;

        /**
         * Additional error information, such as component stack
         * @type {string|null}
         * @private
         */
        this.errorInfo = null;

        /**
         * Configuration options for the error boundary
         * @type {ErrorBoundaryOptions}
         * @private
         */
        this.options = {
            showDetails: true,
            errorTitle: 'Something went wrong',
            retryButtonText: 'Try Again',
            errorDetailsLabel: 'Error details',
            ...options
        };
    }

    /**
     * Executes the render function within the error boundary.
     * If an error occurs during rendering, it will be caught and handled.
     * 
     * @returns {void}
     * @example
     * // Basic usage
     * errorBoundary.render();
     * 
     * // With error handling
     * try {
     *   errorBoundary.render();
     * } catch (error) {
     *   console.error('Rendering failed:', error);
     * }
     */
    render() {
        try {
            // Clear any previous error state
            this.error = null;
            this.errorInfo = null;
            
            // Clear the container
            this.container.innerHTML = '';
            
            // Execute the render function
            this.renderFunction();
        } catch (error) {
            // Handle the error
            this.handleError(error);
        }
    }
    
    /**
     * Handles an error that occurred during rendering.
     * @param {Error} error - The error that was caught
     * @param {string} [errorInfo] - Additional error information (e.g., component stack)
     * @returns {void}
     * @private
     */
    handleError(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.error = error;
        this.errorInfo = errorInfo || error.stack || 'No stack trace available';
        
        // Render the error UI
        this.renderErrorUI();
    }
    }

    /**
     * Renders the error UI when an error is caught by the boundary.
     * This creates a user-friendly error message with options to retry or view details.
     * 
     * @returns {void}
     * @private
     */
    renderErrorUI() {
        if (!this.container) {
            console.warn('Cannot render error UI: container is not defined');
            return;
        }

        // Clear the container
        this.container.innerHTML = '';

        // Create main error container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-boundary';
        
        // Apply styles
        Object.assign(errorDiv.style, {
            padding: '20px',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            margin: '10px 0',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
        });
        
        // Add error message
        const errorMessage = document.createElement('h3');
        errorMessage.textContent = this.options.errorTitle;
        Object.assign(errorMessage.style, {
            marginTop: '0',
            color: '#721c24',
            fontSize: '1.2em',
            marginBottom: '15px'
        });
        
        // Add error description
        const errorDescription = document.createElement('p');
        errorDescription.textContent = 'The application encountered an unexpected error. ';
        errorDescription.textContent += 'You can try reloading the page or contact support if the problem persists.';
        errorDescription.style.marginBottom = '20px';
        
        // Add error details if enabled
        let errorDetails = null;
        if (this.options.showDetails && this.error) {
            errorDetails = document.createElement('details');
            Object.assign(errorDetails.style, {
                marginTop: '15px',
                fontFamily: 'monospace',
                fontSize: '14px',
                marginBottom: '15px'
            });
            
            const summary = document.createElement('summary');
            summary.textContent = this.options.errorDetailsLabel;
            summary.style.cursor = 'pointer';
            summary.style.fontWeight = 'bold';
            
            const pre = document.createElement('pre');
            pre.textContent = this.errorInfo || this.error.toString();
            Object.assign(pre.style, {
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: '10px 0 0 0',
                padding: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
                overflowX: 'auto',
                maxHeight: '300px',
                overflowY: 'auto',
                fontSize: '0.9em'
            });
            
            errorDetails.appendChild(summary);
            errorDetails.appendChild(pre);
        }
        
        // Add retry button
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '15px';
        
        const retryButton = document.createElement('button');
        retryButton.textContent = this.options.retryButtonText;
        Object.assign(retryButton.style, {
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.2s'
        });
        
        // Add hover effect
        retryButton.addEventListener('mouseover', () => {
            retryButton.style.backgroundColor = '#0056b3';
        });
        
        retryButton.addEventListener('mouseout', () => {
            retryButton.style.backgroundColor = '#007bff';
        });
        
        // Add reload button
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Reload Page';
        Object.assign(reloadButton.style, {
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.2s'
        });
        
        // Add hover effect
        reloadButton.addEventListener('mouseover', () => {
            reloadButton.style.backgroundColor = '#5a6268';
        });
        
        reloadButton.addEventListener('mouseout', () => {
            reloadButton.style.backgroundColor = '#6c757d';
        });
        
        // Add event listeners
        retryButton.addEventListener('click', () => {
            this.error = null;
            this.errorInfo = null;
            this.render();
        });
        
        reloadButton.addEventListener('click', () => {
            window.location.reload();
        });
        
        // Build the DOM
        buttonContainer.appendChild(retryButton);
        buttonContainer.appendChild(reloadButton);
        
        errorDiv.appendChild(errorMessage);
        errorDiv.appendChild(errorDescription);
        
        if (errorDetails) {
            errorDiv.appendChild(errorDetails);
        }
        
        errorDiv.appendChild(buttonContainer);
        this.container.appendChild(errorDiv);
        
        // Focus the retry button for better keyboard navigation
        retryButton.focus();
    }
}

// Export the ErrorBoundary class
export default ErrorBoundary;
