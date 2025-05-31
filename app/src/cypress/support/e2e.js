// Import custom commands
import './commands';

// Handle uncaught exceptions to prevent test failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors or log them
  console.error('Uncaught exception:', err);
  return false; // Prevent Cypress from failing the test
});

// Global setup before each test
beforeEach(() => {
  // Reset the database before each test
  cy.resetDatabase();
});