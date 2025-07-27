/**
 * @typedef {Object} AppState
 * @property {string[]} playerCards - Array of card values in the player's hand
 * @property {string} dealerCard - Dealer's up card
 * @property {number} decks - Number of decks in the shoe (1-10)
 * @property {number} penetration - Deck penetration percentage (0-1)
 * @property {string} countingSystem - The counting system in use (e.g., 'hiLo', 'ko')
 * @property {number} trueCount - Current true count
 * @property {boolean} isAdvancedMode - Whether advanced mode is enabled
 * @property {boolean} isLoading - Whether the app is currently loading data
 * @property {Error|null} error - Current error, if any
 * @property {Array<Object>} history - Game history
 * @property {number} bankroll - Current bankroll amount
 * @property {number} minBet - Minimum bet amount
 * @property {number} maxBet - Maximum bet amount
 * @property {number} riskTolerance - Risk tolerance (0-1)
 */

/**
 * Main application class for the Blackjack Card Counter.
 * Handles game state management, user interactions, and UI updates.
 * 
 * @example
 * // Initialize the application
 * const app = new BlackjackApp();
 * 
 * // Add a card to the player's hand
 * app.handleAddCard('A');
 * 
 * // Reset the game
 * app.handleReset();
 */
class BlackjackApp {
    /**
     * Creates a new BlackjackApp instance.
     * Initializes the application state and sets up event listeners.
     * 
     * @param {Object} [options] - Configuration options
     * @param {number} [options.initialBankroll=1000] - Starting bankroll
     * @param {number} [options.initialDecks=3] - Initial number of decks
     * @param {string} [options.countingSystem='hiLo'] - Default counting system
     */
    constructor({ initialBankroll = 1000, initialDecks = 3, countingSystem = 'hiLo' } = {}) {
        /**
         * The current application state
         * @type {AppState}
         * @private
         */
        this.state = {
            // Game state
            playerCards: [],
            dealerCard: '',
            decks: initialDecks,
            penetration: 0.75,
            countingSystem: countingSystem,
            trueCount: 0,
            
            // UI state
            isAdvancedMode: false,
            isLoading: false,
            error: null,
            
            // Game history (array of {playerCards: string[], dealerCard: string, action: string, timestamp: number})
            history: [],
            
            // Bankroll management
            bankroll: initialBankroll,
            minBet: 10,
            maxBet: 500,
            riskTolerance: 0.02
        };
        
        /**
         * Reference to the app container element
         * @type {HTMLElement}
         * @private
         */
        this.appContainer = document.getElementById('app');
        
        if (!this.appContainer) {
            throw new Error('Could not find app container element');
        }
        
        /**
         * Error boundary for the application
         * @type {ErrorBoundary}
         * @private
         */
        this.errorBoundary = new ErrorBoundary(
            this.appContainer,
            () => this.render()
        );
        
        // Bind methods to maintain 'this' context
        this.handleAddCard = this.handleAddCard.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleUndo = this.handleUndo.bind(this);
        this.handleModeToggle = this.handleModeToggle.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateRecommendation = this.updateRecommendation.bind(this);
        
        // Initialize event listeners and render the initial UI
        this.initializeEventListeners();
        this.render();
        
        // Initialize the app
        this.initialize();
    }
    
    /**
     * Initializes the application by setting up event listeners and performing the initial render.
     * This method should be called once when the application starts.
     * 
     * @returns {void}
     * @throws {Error} If required DOM elements are not found
     * 
     * @example
     * // Initialize the application
     * app.initialize();
     */
    initialize() {
        try {
            this.setupEventListeners();
            this.render();
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.errorBoundary.handleError(
                new Error('Failed to initialize application. Please refresh the page.')
            );
            throw error; // Re-throw to allow for error handling by the error boundary
        }
    }
    
    /**
     * Sets up all event listeners for the application UI.
     * This includes card buttons, control buttons, and form inputs.
     * 
     * @returns {void}
     * @throws {Error} If required DOM elements are not found
     * 
     * @private
     */
    setupEventListeners() {
        // Card buttons - dynamically created, so we use event delegation
        const cardContainer = document.querySelector('.card-buttons-container');
        if (!cardContainer) {
            throw new Error('Card buttons container not found');
        }
        
        cardContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.card-button');
            if (button && button.dataset.card) {
                this.handleAddCard(button.dataset.card);
            }
        });
        
        // Control buttons
        const controlButtons = [
            { id: 'reset-button', handler: this.handleReset },
            { id: 'undo-button', handler: this.handleUndo },
            { id: 'mode-toggle', handler: this.handleModeToggle }
        ];
        
        controlButtons.forEach(({ id, handler }) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Control button with ID '${id}' not found`);
                return;
            }
            element.addEventListener('click', handler);
        });
        
        // Form inputs
        const formInputs = [
            'decks-input',
            'penetration-input',
            'bankroll-input',
            'min-bet-input',
            'max-bet-input',
            'risk-tolerance-input',
            'counting-system-select'
        ];
        
        formInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (!element) {
                console.warn(`Form input with ID '${inputId}' not found`);
                return;
            }
            element.addEventListener('change', this.handleInputChange);
        });
        
        // Window resize handler for responsive design
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }
    
    /**
     * Handles adding a card to the current hand and updates the game state accordingly.
     * Validates the card input, updates the player's hand, and triggers UI updates.
     * 
     * @param {string} card - The card to add (e.g., 'A', '2', '10', 'J', 'Q', 'K')
     * @returns {void}
     * @throws {Error} If the card is invalid or if the maximum number of cards is reached
     * 
     * @example
     * // Add an Ace to the player's hand
     * app.handleAddCard('A');
     * 
     * // Add a 10 to the player's hand
     * app.handleAddCard('10');
     */
    handleAddCard(card) {
        // Input validation
        if (typeof card !== 'string' || !card.trim()) {
            throw new Error('Card must be a non-empty string');
        }
        
        // Normalize the card value (uppercase, trim whitespace)
        const normalizedCard = card.trim().toUpperCase();
        
        // Validate card format (A, 2-10, J, Q, K)
        if (!/^(A|[2-9]|10|[JQK])$/.test(normalizedCard)) {
            throw new Error(`Invalid card value: ${card}. Must be A, 2-10, J, Q, or K`);
        }
        
        // Check if we've reached the maximum number of cards (arbitrary limit to prevent UI issues)
        const MAX_CARDS = 10;
        if (this.state.playerCards.length >= MAX_CARDS) {
            throw new Error(`Maximum of ${MAX_CARDS} cards reached`);
        }
        
        try {
            // Validate the card
            const validation = validateGameSettings({ cards: [card] });
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }
            
            // Update state
            this.setState({
                playerCards: [...this.state.playerCards, card],
                error: null
            });
            
            // Update recommendation
            this.updateRecommendation();
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    /**
     * Resets the game to its initial state, clearing all cards and resetting the game state.
     * This method preserves the current settings (decks, bankroll, etc.) but clears all cards
     * and resets the game history.
     * 
     * @returns {void}
     * @fires BlackjackApp#reset
     * 
     * @example
     * // Reset the game
     * app.handleReset();
     */
    handleReset() {
        // Create a custom event for reset
        const resetEvent = new CustomEvent('reset', {
            detail: {
                timestamp: Date.now(),
                previousState: { ...this.state }
            }
        });
        
        try {
            // Dispatch the reset event before actually resetting
            this.appContainer.dispatchEvent(resetEvent);
            
            // Log the reset action
            console.log('Resetting game state');
            
            // Reset state
            this.setState({
                playerCards: [],
                dealerCard: '',
                error: null
            });
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    /**
     * Handle undoing the last action
     */
    handleUndo() {
        if (this.state.playerCards.length > 0) {
            this.setState({
                playerCards: this.state.playerCards.slice(0, -1),
                error: null
            }, () => {
                this.updateRecommendation();
            });
        }
    }
    
    /**
     * Toggle between basic and advanced mode
     */
    handleModeToggle() {
        this.setState({
            isAdvancedMode: !this.state.isAdvancedMode
        });
    }
    
    /**
     * Handle input changes
     * @param {Event} event - The input change event
     */
    handleInputChange(event) {
        const { id, value } = event.target;
        const updates = {};
        
        try {
            // Parse the value based on input type
            let parsedValue;
            if (id.includes('decks') || id.includes('bankroll') || 
                id.includes('bet') || id.includes('risk')) {
                parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) {
                    throw new Error(`Invalid number: ${value}`);
                }
            } else {
                parsedValue = value;
            }
            
            // Update the appropriate state property
            const stateKey = id.replace('-input', '').replace('-select', '');
            updates[stateKey] = parsedValue;
            updates.error = null;
            
            // If decks or counting system changed, update the true count
            if (stateKey === 'decks' || stateKey === 'countingSystem') {
                this.updateTrueCount();
            }
            
            // Update state
            this.setState(updates);
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    /**
     * Update the true count based on current cards and settings
     */
    updateTrueCount() {
        // This is a simplified example - in a real app, you would calculate
        // the true count based on the current cards and counting system
        const { playerCards, dealerCard, decks, countingSystem } = this.state;
        
        // For now, we'll just set a placeholder value
        // In a real implementation, you would calculate this based on the cards
        this.setState({
            trueCount: 0 // Placeholder
        });
    }
    
    /**
     * Update the recommendation based on current state
     */
    async updateRecommendation() {
        const { playerCards, dealerCard, isAdvancedMode } = this.state;
        
        // Skip if we don't have enough cards
        if (playerCards.length === 0) {
            return;
        }
        
        this.setState({ isLoading: true, error: null });
        
        try {
            // In a real implementation, you would make API calls here
            // and update the UI based on the response
            
            // Example API call (commented out for now):
            // const recommendation = await getOptimalStrategy({
            //     playerCards,
            //     dealerCard,
            //     trueCount: this.state.trueCount
            // });
            // 
            // this.setState({
            //     recommendation,
            //     isLoading: false
            // });
            
            // For now, just simulate a delay and update the UI
            setTimeout(() => {
                this.setState({ isLoading: false });
            }, 500);
            
        } catch (error) {
            this.showError(`Failed to get recommendation: ${error.message}`);
            this.setState({ isLoading: false });
        }
    }
    
    /**
     * Show an error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.setState({ error: message });
        
        // Auto-hide the error after 5 seconds
        setTimeout(() => {
            if (this.state.error === message) {
                this.setState({ error: null });
            }
        }, 5000);
    }
    
    /**
     * Update the application state
     * @param {Object} updates - The state updates to apply
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.render();
    }
    
    /**
     * Render the application
     */
    render() {
        // Delegate to the error boundary
        this.errorBoundary.render();
        
        // In a real implementation, you would render the UI here
        // This is a simplified example
        const { playerCards, dealerCard, error, isLoading } = this.state;
        
        // Render the app UI
        this.appContainer.innerHTML = `
            <div class="app-container">
                <header class="app-header">
                    <h1>Blackjack Card Counter</h1>
                    ${error ? `<div class="error-message">${error}</div>` : ''}
                </header>
                
                <main class="app-main">
                    <section class="game-area">
                        <div class="dealer-area">
                            <h2>Dealer's Card</h2>
                            <div class="card-display">${dealerCard || '?'}</div>
                        </div>
                        
                        <div class="player-area">
                            <h2>Your Hand</h2>
                            <div class="card-display">
                                ${playerCards.length > 0 ? 
                                    playerCards.map(card => `<span class="card">${card}</span>`).join('') :
                                    'No cards yet'}
                            </div>
                            <div class="hand-value">
                                ${playerCards.length > 0 ? 
                                    `Value: ${this.calculateHandValue(playerCards)}` : ''}
                            </div>
                        </div>
                        
                        <div class="controls">
                            <button id="reset-button">Reset</button>
                            <button id="undo-button" ${playerCards.length === 0 ? 'disabled' : ''}>
                                Undo
                            </button>
                            <button id="mode-toggle">
                                ${this.state.isAdvancedMode ? 'Basic Mode' : 'Advanced Mode'}
                            </button>
                        </div>
                    </section>
                    
                    <section class="recommendation-area">
                        <h2>Recommendation</h2>
                        <div class="recommendation">
                            ${isLoading ? 'Analyzing...' : 
                              playerCards.length > 0 ? 
                                this.getRecommendationText() : 
                                'Add cards to get a recommendation'}
                        </div>
                    </section>
                </main>
                
                <footer class="app-footer">
                    <p>Blackjack Card Counter &copy; ${new Date().getFullYear()}</p>
                </footer>
            </div>
        `;
        
        // Re-attach event listeners
        this.setupEventListeners();
    }
    
    /**
     * Calculate the value of a hand
     * @param {Array<string>} cards - The cards in the hand
     * @returns {number} The total value of the hand
     */
    calculateHandValue(cards) {
        let value = 0;
        let aces = 0;
        
        for (const card of cards) {
            if (card === 'A') {
                aces++;
                value += 11;
            } else if (['J', 'Q', 'K'].includes(card)) {
                value += 10;
            } else {
                value += parseInt(card) || 0;
            }
        }
        
        // Adjust for aces
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }
    
    /**
     * Get the recommendation text based on current state
     * @returns {string} The recommendation text
     */
    getRecommendationText() {
        const { playerCards, dealerCard } = this.state;
        
        if (playerCards.length === 0) {
            return 'Add cards to get a recommendation';
        }
        
        // This is a simplified example
        // In a real implementation, you would use the recommendation from the API
        const value = this.calculateHandValue(playerCards);
        
        if (value > 21) {
            return 'Bust!';
        } else if (value === 21 && playerCards.length === 2) {
            return 'Blackjack!';
        } else if (value >= 17) {
            return 'Recommendation: Stand';
        } else {
            return 'Recommendation: Hit';
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the app
    window.app = new BlackjackApp();
});
