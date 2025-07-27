/// <reference types="cypress" />

describe('Blackjack Card Counter E2E Tests', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/');
    
    // Clear any existing data
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should load the application', () => {
    // Check that the app title is visible
    cy.contains('h1', 'Blackjack Card Counter').should('be.visible');
    
    // Check that the main components are rendered
    cy.get('[data-testid="card-input"]').should('be.visible');
    cy.get('[data-testid="count-display"]').should('be.visible');
    cy.get('[data-testid="deck-status"]').should('be.visible');
  });

  it('should add cards and update the count', () => {
    // Add a low card (2-6)
    cy.get('[data-testid="card-input"] input').type('2h{enter}');
    
    // Check that the card was added to the grid
    cy.get('[data-testid="card-grid"]').should('contain', '2H');
    
    // Check that the running count increased (for Hi-Lo, 2 is +1)
    cy.get('[data-testid="running-count"]').should('contain', '1');
    
    // Add a high card (10-A)
    cy.get('[data-testid="card-input"] input').type('kd{enter}');
    
    // Check that the running count decreased (for Hi-Lo, K is -1)
    cy.get('[data-testid="running-count"]').should('contain', '0');
    
    // Check that the deck status updated
    cy.get('[data-testid="cards-remaining"]').should('contain', '50');
  });

  it('should show correct bet recommendations', () => {
    // Add cards to get a positive true count
    const lowCards = ['2h', '3d', '4c', '5s', '6h'];
    lowCards.forEach(card => {
      cy.get('[data-testid="card-input"] input').type(`${card}{enter}`);
      // Small delay to ensure UI updates
      cy.wait(100);
    });
    
    // Check that the bet recommendation is higher
    cy.get('[data-testid="bet-recommendation"]')
      .should('be.visible')
      .and('contain', 'Moderate Bet')
      .and('contain', '2-4 units');
  });

  it('should allow removing cards', () => {
    // Add a few cards
    cy.get('[data-testid="card-input"] input').type('as{enter}');
    cy.get('[data-testid="card-input"] input').type('kd{enter}');
    
    // Remove the last card
    cy.get('[data-testid="remove-last-card"]').click();
    
    // Check that only one card remains
    cy.get('[data-testid="card-grid"] [data-testid="card"]').should('have.length', 1);
    
    // Clear all cards
    cy.get('[data-testid="clear-all-cards"]').click();
    
    // Check that no cards remain
    cy.get('[data-testid="card-grid"] [data-testid="card"]').should('not.exist');
  });

  it('should persist data on page refresh', () => {
    // Add some cards
    cy.get('[data-testid="card-input"] input').type('as{enter}');
    cy.get('[data-testid="card-input"] input').type('kd{enter}');
    
    // Get the current count
    let runningCount;
    cy.get('[data-testid="running-count"]').invoke('text').then((text) => {
      runningCount = text.trim();
      
      // Refresh the page
      cy.reload();
      
      // Check that the count is the same
      cy.get('[data-testid="running-count"]').should('contain', runningCount);
      
      // Check that the cards are still there
      cy.get('[data-testid="card-grid"] [data-testid="card"]').should('have.length', 2);
    });
  });

  it('should allow exporting and importing data', () => {
    // Add some cards
    cy.get('[data-testid="card-input"] input').type('as{enter}');
    cy.get('[data-testid="card-input"] input').type('kd{enter}');
    
    // Export the data
    cy.get('[data-testid="export-data"]').click();
    
    // Clear the data
    cy.get('[data-testid="clear-all-cards"]').click();
    
    // Verify the data is cleared
    cy.get('[data-testid="card-grid"] [data-testid="card"]').should('not.exist');
    
    // Import the data back
    cy.get('[data-testid="import-data"]').click();
    
    // Check that the cards are back
    cy.get('[data-testid="card-grid"] [data-testid="card"]').should('have.length', 2);
  });

  it('should show simulation results', () => {
    // Open the simulation panel
    cy.get('[data-testid="simulation-panel-toggle"]').click();
    
    // Start a simulation with default parameters
    cy.get('[data-testid="start-simulation"]').click();
    
    // Wait for simulation to complete (adjust timeout as needed)
    cy.get('[data-testid="simulation-results"]', { timeout: 30000 }).should('be.visible');
    
    // Check that we have some results
    cy.get('[data-testid="win-rate"]').should('contain', '%');
    cy.get('[data-testid="loss-rate"]').should('contain', '%');
    cy.get('[data-testid="push-rate"]').should('contain', '%');
  });

  it('should allow changing settings', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Change the theme
    cy.get('[data-testid="theme-select"]').select('dark');
    
    // Change the counting system
    cy.get('[data-testid="counting-system-select"]').select('KO');
    
    // Save settings
    cy.get('[data-testid="save-settings"]').click();
    
    // Verify the counting system was updated
    cy.get('[data-testid="counting-system"]').should('contain', 'KO');
    
    // Refresh the page to verify persistence
    cy.reload();
    
    // Verify settings were saved
    cy.get('[data-testid="counting-system"]').should('contain', 'KO');
  });

  it('should display help information', () => {
    // Open help
    cy.get('[data-testid="help-button"]').click();
    
    // Check that help content is visible
    cy.get('[data-testid="help-content"]').should('be.visible');
    
    // Close help
    cy.get('[data-testid="close-help"]').click();
    
    // Check that help content is hidden
    cy.get('[data-testid="help-content"]').should('not.be.visible');
  });
});
