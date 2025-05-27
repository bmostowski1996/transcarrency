// Custom command to log in a user
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', '/api/auth/login', {
    email,
    password,
  }).then((response) => {
    // Save the token to local storage
    window.localStorage.setItem('authToken', response.body.token);
  });
});

// Custom command to reset the database
Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', '/api/test/reset');
});

// Custom command to visit a page and ensure the user is logged in
Cypress.Commands.add('visitWithAuth', (url) => {
  const token = window.localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No auth token found. Please log in first.');
  }
  cy.visit(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});