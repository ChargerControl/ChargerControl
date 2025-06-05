import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Common steps for login
Given('I am logged in as a Station Operator', () => {
  // Mock the authentication or perform actual login
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type('operator@example.com');
  cy.get('[data-cy=password-input]').type('password123');
  cy.get('[data-cy=login-button]').click();
  
  // Alternatively, if you want to bypass login and just mock the authenticated state:
  // cy.window().then((win) => {
  //   win.localStorage.setItem('authToken', 'fake-token');
  //   win.localStorage.setItem('userRole', 'OPERATOR');
  // });
  // cy.visit('/operator');
});

When('I navigate to the stations dashboard', () => {
  cy.visit('/operator');
  cy.contains('Estações').should('be.visible');
});

Then('I should see a list of all stations', () => {
  cy.get('table').should('be.visible');
  cy.get('table tbody tr').should('have.length.at.least', 1);
});

Then('I should see station information', () => {
  // Check for specific columns in the table
  cy.get('table thead').should('contain', 'Nome');
  cy.get('table thead').should('contain', 'Status');
  cy.get('table thead').should('contain', 'Tipo');
  cy.get('table thead').should('contain', 'Localização');
});

// Steps for enabling/disabling stations
Given('there is a disabled station', () => {
  // You can either:
  // 1. Mock the API response to include a disabled station
  // 2. Use a cy.request to create/update a station to be disabled via API
  // 3. Or ensure there's at least one disabled station in the test environment
  
  cy.intercept('GET', 'http://localhost:8081/apiV1/stations', (req) => {
    req.reply((res) => {
      // Modify the response to ensure at least one station is disabled
      const stations = res.body;
      if (stations && stations.length > 0) {
        stations[0].available = false;
      }
      res.send({ body: stations });
    });
  }).as('getStations');
  
  cy.visit('/operator');
  cy.wait('@getStations');
});

Given('there is an enabled station', () => {
  // Similar to above but ensure a station is enabled
  cy.intercept('GET', 'http://localhost:8081/apiV1/stations', (req) => {
    req.reply((res) => {
      const stations = res.body;
      if (stations && stations.length > 0) {
        stations[0].available = true;
      }
      res.send({ body: stations });
    });
  }).as('getStations');
  
  cy.visit('/operator');
  cy.wait('@getStations');
});

When('I enable the station', () => {
  // Find the first disabled station and click its enable button
  cy.get('table tbody tr').contains('offline').parent('tr').find('[data-cy=toggle-status-button]').click();
  cy.get('[data-cy=confirm-enable-button]').click();
});

When('I disable the station', () => {
  // Find the first enabled station and click its disable button
  cy.get('table tbody tr').contains('online').parent('tr').find('[data-cy=toggle-status-button]').click();
  cy.get('[data-cy=confirm-disable-button]').click();
});

When('I disable the station for a specific time period', () => {
  // Find the first enabled station and click its disable button
  cy.get('table tbody tr').contains('online').parent('tr').find('[data-cy=toggle-status-button]').click();
  
  // Set a time period
  cy.get('[data-cy=disable-time-select]').click();
  cy.get('[data-value="1"]').click(); // Select 1 hour as an example
  
  cy.get('[data-cy=confirm-disable-button]').click();
});

Then('the station status should change to {string}', (status) => {
  // Check if the first row contains the expected status
  cy.get('table tbody tr').first().should('contain', status);
});

Then('users with bookings should be notified', () => {
  // This might be difficult to test directly in UI tests
  // Could mock the API call and verify it was made correctly
  cy.get('[data-cy=notification-success]').should('be.visible');
});

Then('the station should be scheduled to re-enable automatically', () => {
  // Check for a UI indication that the station will be re-enabled
  cy.get('[data-cy=scheduled-enable-indicator]').should('be.visible');
});
