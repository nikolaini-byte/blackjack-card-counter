// This file configures web workers for Create React App
// It ensures proper handling of worker files during the build process

// This is a workaround for Create React App's web worker handling
// It allows us to use the worker-loader in development while maintaining compatibility with CRA

// In development, we can use worker-loader
// In production, the worker will be properly bundled

// This file is intentionally left empty as we're using the standard Web Worker API
// with the worker-plugin in the webpack configuration

// The actual worker code is in simulation.worker.js
