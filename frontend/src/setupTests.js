// Import the jest-dom library for custom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverStub;

// Mock the IntersectionObserver
class IntersectionObserverStub {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    // Immediately trigger the callback with all entries as intersecting
    this.callback([{ isIntersecting: true }]);
  }
  
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = IntersectionObserverStub;

// Mock the scrollIntoView method
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock the requestAnimationFrame
window.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

window.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock the fetch API
const mockResponse = (status, statusText, response) => {
  return new window.Response(JSON.stringify(response), {
    status,
    statusText,
    headers: {
      'Content-Type': 'application/json'
    }
  });};

global.fetch = jest.fn().mockImplementation((url) => {
  // Add custom fetch mocks here if needed
  return Promise.resolve(mockResponse(200, 'OK', {}));
});

// Mock console methods to keep test output clean
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress specific warnings/errors in tests
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    // Ignore specific warnings
    if (
      args[0]?.includes('React does not recognize the `%s` prop on a DOM element.') ||
      args[0]?.includes('Invalid DOM property') ||
      args[0]?.includes('Unknown event handler property') ||
      args[0]?.includes('Using kebab-case for css properties') ||
      args[0]?.includes('The tag <unknown> is unrecognized in this browser.')
    ) {
      return;
    }
    originalConsoleError(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    // Ignore specific warnings
    if (
      args[0]?.includes('componentWillReceiveProps has been renamed') ||
      args[0]?.includes('componentWillMount has been renamed') ||
      args[0]?.includes('componentWillUpdate has been renamed') ||
      args[0]?.includes('React does not recognize the `%s` prop on a DOM element.') ||
      args[0]?.includes('Using kebab-case for css properties')
    ) {
      return;
    }
    originalConsoleWarn(...args);
  });
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
  
  // Clear localStorage
  window.localStorage.clear();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
