// Simple script to run frontend tests
const jest = require('jest');

const config = {
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
};

// Run Jest programmatically
jest.runCLI(config, [process.cwd()])
  .then(({ results }) => {
    console.log('Tests completed');
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
