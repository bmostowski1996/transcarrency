describe('User API Tests', () => {
    beforeEach(() => {
      // Load mock data from fixtures
      cy.fixture('mockUsers').as('users');
    });
  
    it('should fetch all users', function () {
      // Mock the API response
      cy.intercept('GET', '/api/users', {
        statusCode: 200,
        body: this.users,
      }).as('getUsers');
          
      // Visit the page that fetches users
      cy.visit('/users'); // Replace with the actual route in your app
  
      // Wait for the API call
      cy.wait('@getUsers');
  
      // Assert that the users are displayed on the page
      cy.get('.user').should('have.length', this.users.length);
      cy.get('.user').first().should('contain', 'John Doe');
    });
  
    it('should display user details when a user is clicked', function () {
      // Mock the API response for a single user
      cy.intercept('GET', '/api/users/1', {
        statusCode: 200,
        body: this.users[0],
      }).as('getUser');
  
      // Visit the user details page
      cy.visit('/users/1'); // Replace with the actual route in your app
  
      // Wait for the API call
      cy.wait('@getUser');
  
      // Assert that the user details are displayed
      cy.get('.user-details').should('contain', 'John Doe');
      cy.get('.user-details').should('contain', 'john@example.com');
    });
  });