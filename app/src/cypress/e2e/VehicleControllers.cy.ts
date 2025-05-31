describe('Vehicle API Tests', () => {
    beforeEach(() => {
      // Load mock data from fixtures
      cy.fixture('mockUsers').as('users');
    });

    it('should fetch all vehicles', function () {
        // Mock the API response
        cy.intercept('GET', '/api/vehicles', {
          statusCode: 200,
          body: this.users,
        }).as('getVehicles');

        // Visit the page that fetches vehicles
        cy.visit('/vehicles'); // Replace with the actual route in your app

        // Wait for the API call
        cy.wait('getVehicles'); 

        // Assert that the vehicles are displayed on the page
        cy.get('.vehicle').should('have.length', this.users.length);
        cy.get('vehicle').first().should('contain', 'Dodge');
    });

    it('should display vehicle details when a vehicle is clicked', function () {
        // Mock the API response for a single vehicle
        cy.intercept('GET', '/api/vehicles/1', {
          statusCode: 200,
          body: this.users[0],
        }).as('getVehicle');

        // Visit the vehicle details page
        cy.visit('/vehicles/1'); // Replace with the actual route in your app

        // Wait for the API call
        cy.wait('@getVehicle');

        // Assert that the vehicle details are displayed
        cy.get('.vehicle-details').should('contain', 'Dodge');
        cy.get('.vehicle-details').should('contain', 'Charger');
      });