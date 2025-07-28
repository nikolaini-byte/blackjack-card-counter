// Card counting systems
export const COUNTING_SYSTEMS = {
  hilo: {
    id: 'hilo',
    name: 'Hi-Lo',
    description: 'Balanced system with True Count conversion',
    cardValues: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
    balanced: true,
  },
  ko: {
    id: 'ko',
    name: 'KO',
    description: 'Unbalanced system, uses running count directly',
    cardValues: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 1, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
    balanced: false,
  },
};

// Card ranks and values
export const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const CARD_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 // Aces can be 1 or 11
};

// Default settings
export const DEFAULT_SETTINGS = {
  decks: 6,
  system: 'hilo',
  theme: 'light',
  showHelp: false,
  showSystemInfo: false,
};

// ARIA labels for accessibility
export const ARIA_LABELS = {
  addCard: 'Add card',
  removeCard: 'Remove card',
  changeSystem: 'Change counting system',
  toggleDeckCount: 'Toggle deck count',
  toggleHelp: 'Toggle help',
  toggleInfo: 'Toggle system info',
  card: 'Card',
  playerHand: 'Player hand',
  dealerHand: 'Dealer hand',
  runningCount: 'Running count',
  trueCount: 'True count',
  decksRemaining: 'Decks remaining',
};

// Button labels and messages
export const BUTTON_LABELS = {
  addCard: 'Add Card',
  removeCard: 'Remove Last Card',
  reset: 'Reset',
  simulate: 'Simulate',
  showHelp: 'Show Help',
  hideHelp: 'Hide Help',
  showSystemInfo: 'System Info',
  hideSystemInfo: 'Hide Info',
};

// Help text and information
export const HELP_TEXT = {
  title: 'Blackjack Card Counter Help',
  intro: 'Use this tool to keep track of the card count while playing Blackjack.',
  howToUse: [
    '1. Select a counting system from the dropdown',
    '2. Set the number of decks being used',
    '3. Click on cards to add them to the appropriate hand',
    '4. Toggle card visibility by clicking on them',
    '5. Use the simulation feature to practice',
  ],
  countingTips: [
    'Hi-Lo System: +1 for 2-6, 0 for 7-9, -1 for 10-A',
    'KO System: +1 for 2-7, 0 for 8-9, -1 for 10-A',
    'True Count = Running Count / Decks Remaining',
  ],
};

// System information
export const SYSTEM_INFO = {
  title: 'Counting System Information',
  description: 'Different card counting systems assign different values to cards.',
  systems: Object.values(COUNTING_SYSTEMS).map(sys => ({
    name: sys.name,
    description: sys.description,
  })),
};

// Simulation settings
export const SIMULATION_SETTINGS = {
  minDecks: 1,
  maxDecks: 8,
  defaultDecks: 6,
  minSpeed: 1,
  maxSpeed: 10,
  defaultSpeed: 5,
};

// Error messages
export const ERROR_MESSAGES = {
  invalidCard: 'Invalid card rank',
  invalidDeckCount: 'Number of decks must be between 1 and 8',
  simulationError: 'Error during simulation',
};

// Local storage keys
export const STORAGE_KEYS = {
  settings: 'blackjack_counter_settings',
  cards: 'blackjack_counter_cards',
  system: 'blackjack_counter_system',
  decks: 'blackjack_counter_decks',
};
