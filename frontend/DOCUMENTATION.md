# Blackjack Card Counter - Frontend Documentation

## 📚 Table of Contents
- [Project Structure](#-project-structure)
- [Component Architecture](#-component-architecture)
- [State Management](#-state-management)
- [Custom Hooks](#-custom-hooks)
- [Utilities](#-utilities)
- [Testing](#-testing)
- [Performance Optimizations](#-performance-optimizations)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Project Structure

```
frontend/
├── public/                  # Static files
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # Reusable UI components
│   │   ├── Card/            # Card display component
│   │   ├── CardGrid/        # Grid layout for cards
│   │   ├── CardInput/       # Card input interface
│   │   ├── CountDisplay/    # Count and betting info
│   │   ├── DeckStatus/      # Deck penetration and status
│   │   ├── ImportExport/    # Data import/export UI
│   │   ├── Layout/          # Layout components
│   │   ├── Simulation/      # Simulation interface
│   │   └── UI/              # Common UI elements
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useCardCounting.js
│   │   ├── useImportExport.js
│   │   ├── useMemoizedCalculations.js
│   │   └── useSimulation.js
│   │
│   ├── store/               # State management
│   │   ├── index.js         # Redux store setup
│   │   └── slices/          # Redux slices
│   │       ├── gameSlice.js
│   │       └── settingsSlice.js
│   │
│   ├── styles/              # Global styles
│   ├── utils/               # Utility functions
│   │   ├── countingSystems.js
│   │   ├── simulation.js
│   │   └── storage.js
│   │
│   ├── App.js               # Main App component
│   ├── index.js             # Entry point
│   └── setupTests.js        # Test setup
│
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── cypress/                 # E2E tests
├── jest.config.js           # Jest configuration
└── package.json             # Dependencies and scripts
```

## 🧩 Component Architecture

### Core Components

#### 1. Card Component (`components/Card`)
- Displays individual playing cards with animations
- Handles face-up/face-down states
- Responsive sizing and styling based on props

#### 2. CardGrid Component (`components/CardGrid`)
- Responsive grid layout for displaying multiple cards
- Handles card animations and transitions
- Customizable grid sizing and spacing

#### 3. CardInput Component (`components/CardInput`)
- Handles user input for adding cards
- Provides visual feedback and validation
- Supports keyboard shortcuts and quick entry

#### 4. CountDisplay Component (`components/CountDisplay`)
- Shows running count, true count, and betting recommendations
- Visual indicators for count strength
- Tooltips with counting system information

#### 5. DeckStatus Component (`components/DeckStatus`)
- Displays deck penetration and cards remaining
- Visual representation of deck composition
- Reshuffle controls and indicators

### Layout Components

#### 1. MainLayout (`components/Layout/MainLayout`)
- Overall page layout structure
- Header, footer, and navigation
- Responsive design breakpoints

#### 2. GameBoard (`components/Layout/GameBoard`)
- Main game area layout
- Card display and input sections
- Responsive grid system

## 🏗️ State Management

### Redux Store Structure

```javascript
{
  game: {
    cards: [],                // Array of card objects
    runningCount: 0,         // Current running count
    trueCount: 0,            // Current true count
    decksRemaining: 6,       // Number of decks remaining
    selectedSystem: 'HILO',  // Current counting system
    betRecommendation: {     // Current betting recommendation
      text: 'Min',
      color: 'gray',
      unit: '1 unit',
      multiplier: 1
    }
  },
  settings: {
    theme: 'dark',           // UI theme
    soundEnabled: true,      // Sound effects
    autoSave: true,          // Auto-save progress
    animationSpeed: 1,       // Animation speed multiplier
    countingSystem: 'HILO',  // Selected counting system
    deckCount: 6,            // Number of decks
    showHelp: true           // Show help tooltips
  },
  simulation: {
    isRunning: false,        // Simulation in progress
    progress: 0,             // Simulation progress (0-100)
    results: null,           // Simulation results
    error: null              // Simulation error
  }
}
```

## 🎣 Custom Hooks

### 1. useCardCounting
- Handles card counting logic
- Manages running count and true count calculations
- Provides betting recommendations

### 2. useImportExport
- Manages data import/export functionality
- Handles file operations and validation
- Provides progress and error states

### 3. useMemoizedCalculations
- Memoizes expensive calculations
- Optimizes performance for count updates
- Reduces unnecessary re-renders

### 4. useSimulation
- Manages simulation state and logic
- Handles Web Worker communication
- Processes simulation results

## 🛠️ Utilities

### 1. countingSystems.js
- Implements different card counting systems
- Provides consistent card value lookups
- Handles system-specific calculations

### 2. simulation.js
- Core simulation logic
- Hand evaluation and strategy implementation
- Statistical analysis and reporting

### 3. storage.js
- Local storage management
- Data validation and migration
- Version control and backward compatibility

## 🧪 Testing

### Unit Tests
- Test files are co-located with their source files in `__tests__` directories
- Uses Jest and React Testing Library
- Covers utility functions, hooks, and components

### Integration Tests
- Tests component interactions
- Verifies state management
- Ensures data flow between components

### E2E Tests
- Uses Cypress for browser automation
- Tests complete user flows
- Verifies cross-browser compatibility

## ⚡ Performance Optimizations

### 1. Code Splitting
- React.lazy for route-based code splitting
- Dynamic imports for heavy components
- Reduced initial bundle size

### 2. Memoization
- useMemo for expensive calculations
- React.memo for component memoization
- Custom comparison functions

### 3. Virtualization
- Virtualized lists for large card sets
- Windowed rendering for performance
- Efficient DOM updates

### 4. Web Workers
- Offloads heavy computations
- Prevents UI thread blocking
- Improves responsiveness

## 🚀 Deployment

### Development
```bash
npm start
```
- Starts development server
- Hot module replacement
- Source maps for debugging

### Production Build
```bash
npm run build
```
- Optimized production build
- Minified assets
- Code splitting

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run cypress:open
```

## 🐛 Troubleshooting

### Common Issues

#### 1. State Not Updating
- Check Redux DevTools for state changes
- Verify action creators are being called
- Ensure reducers are handling actions correctly

#### 2. Performance Problems
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Verify memoization is working

#### 3. Build Failures
- Check for dependency conflicts
- Verify Node.js version compatibility
- Clear npm cache and node_modules

### Getting Help
- Check the [GitHub Issues](https://github.com/yourusername/blackjack-card-counter/issues)
- Search the documentation
- Submit a bug report

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cypress](https://www.cypress.io/)
- [Jest](https://jestjs.io/)
