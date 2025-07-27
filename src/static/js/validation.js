/**
 * @fileoverview Frontend validation utilities for the Blackjack Card Counter.
 * @module validation
 * @description Provides comprehensive validation functions for user inputs,
 * game state, and API responses to ensure data integrity and prevent errors.
 */

/**
 * Represents a playing card rank (e.g., 'A', '2', ..., '10', 'J', 'Q', 'K')
 * @typedef {('A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K')} CardRank
 */

/**
 * Represents a counting system identifier
 * @typedef {('hiLo'|'ko'|'omega2'|'zenCount')} CountingSystem
 */

/**
 * Standard validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string} [message] - Error message if validation failed
 */

/**
 * Valid card ranks for the game
 * @type {Set<CardRank>}
 * @readonly
 */
const VALID_CARDS = new Set(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']);

/**
 * Supported card counting systems
 * @type {Set<CountingSystem>}
 * @readonly
 */
const VALID_COUNTING_SYSTEMS = new Set(['hiLo', 'ko', 'omega2', 'zenCount']);

/**
 * Validates if a string represents a valid playing card rank.
 * @param {unknown} card - The value to validate as a card rank
 * @returns {card is CardRank} True if the input is a valid card rank
 * @example
 * // Returns true
 * isValidCard('A');
 * @example
 * // Returns false
 * isValidCard('X');
 */
function isValidCard(card) {
    return typeof card === 'string' && VALID_CARDS.has(/** @type {CardRank} */ (card.toUpperCase()));
}

/**
 * Validates an array of card ranks.
 * @param {unknown} cards - The value to validate as an array of card ranks
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validateCards(['A', 'K', '10']);
 * @example
 * // Returns { isValid: false, message: 'Cards must be provided as an array' }
 * validateCards('not an array');
 * @example
 * // Returns { isValid: false, message: 'Invalid card at position 2: X. Valid values are: ...' }
 * validateCards(['A', 'K', 'X']);
 */
function validateCards(cards) {
    if (!Array.isArray(cards)) {
        return {
            isValid: false,
            message: 'Cards must be provided as an array'
        };
    }

    // Handle empty array case
    if (cards.length === 0) {
        return {
            isValid: true
        };
    }

    // Check each card in the array
    for (const [index, card] of cards.entries()) {
        if (!isValidCard(card)) {
            return {
                isValid: false,
                message: `Invalid card at position ${index + 1}: "${card}". ` +
                         `Valid values are: ${Array.from(VALID_CARDS).join(', ')}`
            };
        }
    }

    return { isValid: true };
}

/**
 * Validates the number of decks in a blackjack shoe.
 * @param {unknown} decks - The value to validate as number of decks
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validateDecks(6);
 * @example
 * // Returns { isValid: false, message: 'Number of decks must be an integer between 1 and 10' }
 * validateDecks(0);
 */
function validateDecks(decks) {
    const numDecks = Number(decks);
    if (isNaN(numDecks) || !Number.isInteger(numDecks) || numDecks < 1 || numDecks > 10) {
        return {
            isValid: false,
            message: 'Number of decks must be an integer between 1 and 10'
        };
    }
    return { isValid: true };
}

/**
 * Validates a card counting system identifier.
 * @param {unknown} system - The counting system to validate
 * @returns {ValidationResult & { system?: CountingSystem }} Validation result with optional valid system
 * @example
 * // Returns { isValid: true, system: 'hiLo' }
 * validateCountingSystem('hiLo');
 * @example
 * // Returns { isValid: false, message: 'Invalid counting system: invalid. Valid systems are: ...' }
 * validateCountingSystem('invalid');
 */
function validateCountingSystem(system) {
    if (typeof system !== 'string' || !VALID_COUNTING_SYSTEMS.has(/** @type {CountingSystem} */ (system))) {
        return {
            isValid: false,
            message: `Invalid counting system: ${system}. ` +
                    `Valid systems are: ${Array.from(VALID_COUNTING_SYSTEMS).join(', ')}`
        };
    }
    return { 
        isValid: true,
        system: /** @type {CountingSystem} */ (system)
    };
}

/**
 * Validates the deck penetration percentage.
 * @param {unknown} penetration - The penetration percentage to validate (0-100)
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validatePenetration(75);
 * @example
 * // Returns { isValid: false, message: 'Penetration must be a number between 0 and 100' }
 * validatePenetration(150);
 */
function validatePenetration(penetration) {
    const penValue = Number(penetration);
    if (isNaN(penValue) || penValue < 0 || penValue > 100) {
        return {
            isValid: false,
            message: 'Penetration must be a number between 0 and 100'
        };
    }
    return { isValid: true };
}

/**
 * Validates a true count value for card counting.
 * @param {unknown} trueCount - The true count to validate
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validateTrueCount(3.5);
 * @example
 * // Returns { isValid: false, message: 'True count must be a number between -20 and 20' }
 * validateTrueCount(25);
 */
function validateTrueCount(trueCount) {
    const count = Number(trueCount);
    if (isNaN(count) || count < -20 || count > 20) {
        return {
            isValid: false,
            message: 'True count must be a number between -20 and 20'
        };
    }
    return { isValid: true };
}

/**
 * Validates a bankroll amount.
 * @param {unknown} bankroll - The bankroll amount to validate
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validateBankroll(1000);
 * @example
 * // Returns { isValid: false, message: 'Bankroll must be a positive number' }
 * validateBankroll(-100);
 */
function validateBankroll(bankroll) {
    const amount = Number(bankroll);
    if (isNaN(amount) || amount <= 0) {
        return {
            isValid: false,
            message: 'Bankroll must be a positive number'
        };
    }
    return { isValid: true };
}

/**
 * Validates minimum and maximum bet amounts.
 * @param {unknown} minBet - The minimum bet amount to validate
 * @param {unknown} maxBet - The maximum bet amount to validate
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validateBetLimits(10, 500);
 * @example
 * // Returns { isValid: false, message: 'Minimum bet must be a positive number' }
 * validateBetLimits(0, 500);
 * @example
 * // Returns { isValid: false, message: 'Minimum bet cannot be greater than maximum bet' }
 * validateBetLimits(100, 50);
 */
function validateBetLimits(minBet, maxBet) {
    const min = Number(minBet);
    const max = Number(maxBet);
    
    // Validate minimum bet
    if (isNaN(min) || min <= 0) {
        return {
            isValid: false,
            message: 'Minimum bet must be a positive number'
        };
    }
    
    // Validate maximum bet
    if (isNaN(max) || max <= 0) {
        return {
            isValid: false,
            message: 'Maximum bet must be a positive number'
        };
    }
    
    // Validate that min is not greater than max
    if (min > max) {
        return {
            isValid: false,
            message: 'Minimum bet cannot be greater than maximum bet'
        };
    }
    
    return { isValid: true };
}

/**
 * Game settings object for validation
 * @typedef {Object} GameSettings
 * @property {CardRank[]} [cards] - Optional array of card ranks
 * @property {CardRank} [dealerCard] - Optional dealer's up card
 * @property {number} [decks] - Optional number of decks in the shoe
 * @property {CountingSystem} [countingSystem] - Optional card counting system
 * @property {number} [penetration] - Optional deck penetration percentage (0-100)
 * @property {number} [trueCount] - Optional true count value
 * @property {number} [bankroll] - Optional bankroll amount
 * @property {number} [minBet] - Optional minimum bet amount
 * @property {number} [maxBet] - Optional maximum bet amount
 */

/**
 * Validates a game settings object with multiple validation rules.
 * @param {unknown} settings - The game settings object to validate
 * @returns {ValidationResult} Validation result object
 * @example
 * // Returns { isValid: true }
 * validateGameSettings({
 *   cards: ['A', 'K'],
 *   decks: 6,
 *   countingSystem: 'hiLo',
 *   penetration: 75
 * });
 * @example
 * // Returns { isValid: false, message: 'Invalid card value: X' }
 * validateGameSettings({ cards: ['A', 'X'] });
 */
function validateGameSettings(settings) {
    // Check if settings is an object
    if (typeof settings !== 'object' || settings === null) {
        return {
            isValid: false,
            message: 'Settings must be an object'
        };
    }
    
    // Validate cards if provided
    if ('cards' in settings) {
        const cardsResult = validateCards(settings.cards);
        if (!cardsResult.isValid) return cardsResult;
    }
    
    // Validate dealer card if provided
    if ('dealerCard' in settings && settings.dealerCard !== undefined) {
        if (!isValidCard(settings.dealerCard)) {
            return {
                isValid: false,
                message: `Invalid dealer card: ${settings.dealerCard}. ` +
                        `Valid values are: ${Array.from(VALID_CARDS).join(', ')}`
            };
        }
    }
    
    // Validate number of decks if provided
    if ('decks' in settings && settings.decks !== undefined) {
        const decksResult = validateDecks(settings.decks);
        if (!decksResult.isValid) return decksResult;
    }
    
    // Validate counting system if provided
    if ('countingSystem' in settings && settings.countingSystem !== undefined) {
        const systemResult = validateCountingSystem(settings.countingSystem);
        if (!systemResult.isValid) return systemResult;
    }
    
    // Validate penetration if provided
    if ('penetration' in settings && settings.penetration !== undefined) {
        const penResult = validatePenetration(settings.penetration);
        if (!penResult.isValid) return penResult;
    }
    
    // Validate true count if provided
    if ('trueCount' in settings && settings.trueCount !== undefined) {
        const countResult = validateTrueCount(settings.trueCount);
        if (!countResult.isValid) return countResult;
    }
    
    // Validate bankroll if provided
    if ('bankroll' in settings && settings.bankroll !== undefined) {
        const bankrollResult = validateBankroll(settings.bankroll);
        if (!bankrollResult.isValid) return bankrollResult;
    }
    
    // Validate bet limits if either min or max bet is provided
    if (('minBet' in settings || 'maxBet' in settings) && 
        (settings.minBet !== undefined || settings.maxBet !== undefined)) {
        const minBet = settings.minBet !== undefined ? settings.minBet : 0;
        const maxBet = settings.maxBet !== undefined ? settings.maxBet : Infinity;
        const betResult = validateBetLimits(minBet, maxBet);
        if (!betResult.isValid) return betResult;
    }
    
    return { isValid: true };
}

// Export all validation functions
export {
    isValidCard,
    validateCards,
    validateDecks,
    validateCountingSystem,
    validatePenetration,
    validateTrueCount,
    validateBankroll,
    validateBetLimits,
    validateGameSettings,
    VALID_CARDS,
    VALID_COUNTING_SYSTEMS
};
