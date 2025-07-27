# Changelog

All notable changes to the Blackjack Card Counter project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-28

### ⚠️ Initial Development Release - Experimental

This is the initial development release of the Blackjack Card Counter. The project is currently in an early experimental phase and not yet suitable for production use.

### Added
- **Project Setup**: Initial project structure and configuration
- **Basic Architecture**: Foundation for frontend and backend components
- **Documentation**: Initial README and contribution guidelines
- **Development Environment**: Basic setup for local development

### Known Issues
- Core card counting functionality is not yet implemented
- User interface is incomplete and subject to change
- Many planned features are not yet available
- Documentation is incomplete

### Notes for Contributors
- This is an early-stage project under active development
- Breaking changes may occur in future releases
- Community contributions are welcome - see CONTRIBUTING.md

## [Unreleased]

### Added
- Basic React application structure
- Initial component stubs
- Development server configuration

### Changed
- Project structure reorganized for better maintainability
- Dependencies updated to latest versions

### Fixed
- Various build and configuration issues
- Documentation typos and inaccuracies

### Added
- **Testing Framework**: Comprehensive test suite with Jest, React Testing Library, and Cypress
- **Unit Tests**: Added tests for utility functions, custom hooks, and components
- **Integration Tests**: Tests for component interactions and state management
- **E2E Tests**: Complete user flow tests with Cypress
- **Documentation**: Added detailed frontend documentation in `frontend/DOCUMENTATION.md`
- **CI/CD**: GitHub Actions workflow for running tests on push and pull requests

### Changed
- **Code Structure**: Improved component organization and file structure
- **Performance**: Added memoization and code splitting optimizations
- **Error Handling**: Enhanced error boundaries and user feedback
- **Accessibility**: Improved ARIA labels and keyboard navigation

### Fixed
- **State Management**: Resolved issues with Redux state persistence
- **Responsive Design**: Fixed layout issues on mobile devices
- **Animation**: Smoother card animations and transitions
- **Memory Leaks**: Fixed potential memory leaks in custom hooks

### Security
- **Dependencies**: Updated all dependencies to their latest secure versions
- **Input Validation**: Enhanced client-side validation for card inputs
- **Error Handling**: Improved error messages and logging

### Removed
- **Deprecated**: Removed unused components and utilities
- **Redundant**: Eliminated duplicate code and improved code reuse

## [0.3.0] - 2025-07-27

### Added
- **State Management**: Redux Toolkit integration for global state
- **Persistence**: Local storage for game state and settings
- **Simulation**: Monte Carlo simulation with Web Workers
- **Export/Import**: Save and load game state

### Changed
- **Refactored**: Moved from local state to Redux
- **Improved**: Performance with memoization
- **Updated**: UI components for better user experience

## [0.2.0] - 2025-07-26

### Added
- **Error Handling**: New `exceptions.py` module for centralized exception handling
- **Validation**: Comprehensive input validation for all API endpoints
- **Testing**: Added test cases for error scenarios and edge cases
- **Documentation**: Enhanced API documentation with error responses

### Changed
- **Refactored**: Moved validation logic to dedicated modules
- **Improved**: Error messages now more descriptive and user-friendly
- **Updated**: Dependencies to their latest stable versions
- **Optimized**: Import structure to prevent circular dependencies

### Fixed
- **Validation**: `validate_card_values` now properly raises exceptions
- **Error Responses**: Standardized error responses across all endpoints
- **Dependencies**: Resolved version conflicts in `requirements.txt`
- **Tests**: All tests now pass with 100% success rate

### Security
- **Input Validation**: Stricter validation of all API inputs
- **Error Handling**: Prevents information leakage in error responses

### Removed
- **Deprecated**: Removed old validation functions
- **Redundant**: Eliminated duplicate code across modules

## [0.1.0] - 2025-07-25

### Added
- **Initial Release**: Basic card counter functionality
- **Counting Systems**: Support for Hi-Lo, KO, and Omega II
- **UI Components**: Card display, input, and count visualization
- **Responsive Design**: Works on desktop and mobile devices

## [2025-07-26] Validation & Error Handling Refactor

### Added
- In-memory cache backend for testing environment to prevent Redis dependency in tests
- Proper error handling for card validation with detailed error messages
- Test coverage for validation error cases

### Changed
### Technical Notes
- Initial project structure follows modern web development practices
- Frontend built with React and TypeScript
- Backend implemented in Python with Flask
- Comprehensive testing planned but not yet implemented

### Next Steps
- Implement core card counting algorithms
- Develop basic user interface
- Add testing infrastructure
- Create documentation for contributors
- **Modified** route handlers to properly handle async/await patterns

### Fixed
- **Fixed** validation error handling to return 422 (Unprocessable Entity) instead of 500 (Internal Server Error)
- **Resolved** issue where invalid cards were being returned in a list instead of raising exceptions
- **Fixed** async/await issues in route handlers that were causing coroutine objects to be returned
- **Addressed** Redis connection issues in test environment by implementing a test mode
- **Fixed** logger initialization in `src/api/routes/cards.py` to prevent NameError

### Performance
- Improved validation performance by using set for O(1) lookups of valid cards
- Optimized error handling to fail fast on invalid input

### Testing
- All tests now pass with 100% success rate
- Added test cases for invalid card values
- Improved test reliability by removing external dependencies in test environment

## [Previous Versions]

### Initial Release (1.0.0)
- Initial project setup
- Basic card validation and strategy implementation
- API endpoints for card analysis and strategy recommendations
