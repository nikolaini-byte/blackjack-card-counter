module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ],
  
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],
  
  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // An array of regexp pattern strings that are matched against all test paths before executing the test
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Reset the module registry before running each individual test
  resetModules: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/setupTests.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // The maximum amount of workers used to run your tests. Can be specified as % or a number
  maxWorkers: '50%',
  
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleDirectories: ['node_modules', 'src']
};
