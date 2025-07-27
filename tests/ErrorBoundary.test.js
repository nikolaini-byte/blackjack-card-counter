/**
 * Tests for the ErrorBoundary component
 */
import ErrorBoundary from '../src/static/js/components/ErrorBoundary.js';

// Mock console.error to avoid polluting test output
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
    let container;
    let errorBoundary;
    
    beforeEach(() => {
        // Set up a clean container for each test
        container = document.createElement('div');
        document.body.appendChild(container);
        
        // Create a mock render function that will throw an error
        const errorRender = () => {
            throw new Error('Test error');
        };
        
        // Create the error boundary with the mock render function
        errorBoundary = new ErrorBoundary(container, errorRender);
    });
    
    afterEach(() => {
        // Clean up after each test
        document.body.removeChild(container);
        container = null;
        errorBoundary = null;
    });
    
    test('should catch errors in render function', () => {
        // Render should catch the error and display the error UI
        errorBoundary.render();
        
        // The error message should be displayed
        expect(container.textContent).toContain('Something went wrong');
        expect(container.querySelector('.error-boundary')).not.toBeNull();
        
        // The error details should be hidden by default
        const details = container.querySelector('details');
        expect(details).not.toBeNull();
        expect(details.open).toBeFalsy();
    });
    
    test('should show error details when expanded', () => {
        errorBoundary.render();
        
        // Click the details summary to expand
        const summary = container.querySelector('summary');
        summary.click();
        
        // The details should now be visible
        const details = container.querySelector('details');
        expect(details.open).toBeTruthy();
        
        // The error message should be in the details
        const pre = container.querySelector('pre');
        expect(pre.textContent).toContain('Test error');
    });
    
    test('should recover after error when retry is clicked', () => {
        // First render will throw an error
        errorBoundary.render();
        
        // Mock the render function to not throw an error on retry
        const successRender = jest.fn();
        errorBoundary.renderFunction = successRender;
        
        // Click the retry button
        const retryButton = container.querySelector('button');
        retryButton.click();
        
        // The success render function should have been called
        expect(successRender).toHaveBeenCalledTimes(1);
        
        // The error UI should be cleared
        expect(container.querySelector('.error-boundary')).toBeNull();
    });
    
    test('should handle missing container gracefully', () => {
        // Create an error boundary with a non-existent container
        const badBoundary = new ErrorBoundary(null, () => {});
        
        // This should not throw an error
        expect(() => badBoundary.render()).not.toThrow();
    });
    
    test('should handle missing render function gracefully', () => {
        // Create an error boundary with no render function
        const badBoundary = new ErrorBoundary(container, null);
        
        // This should not throw an error
        expect(() => badBoundary.render()).not.toThrow();
    });
});
