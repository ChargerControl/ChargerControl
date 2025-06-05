import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// We can reuse the login step from the previous file
// Specific steps for the Add Station feature

When('I click on "Add Station" button', () => {
  cy.get('[data-cy=add-station-button]').click();
});

Then('I should see the add station form', () => {
  cy.get('[data-cy=add-station-dialog]').should('be.visible');
  cy.contains('Adicionar Nova Estação').should('be.visible');
});

Given('I am on the add station form', () => {
  // Navigate to the stations page and open the add form
  cy.visit('/operator');
  cy.get('[data-cy=add-station-button]').click();
  cy.get('[data-cy=add-station-dialog]').should('be.visible');
});

When('I fill in the station information with:', (dataTable) => {
  // Convert the data table to an object for easier access
  const formData = {};
  dataTable.hashes().forEach(row => {
    formData[row.field] = row.value;
  });

  // Fill in the form fields based on the data table
  if (formData.name) {
    cy.get('[data-cy=station-name-input]').clear().type(formData.name);
  }
  
  if (formData.location) {
    cy.get('[data-cy=station-location-input]').clear().type(formData.location);
  }
  
  if (formData.chargingType) {
    cy.get('[data-cy=station-charging-type-select]').click();
    cy.get(`[data-value="${formData.chargingType}"]`).click();
  }
  
  if (formData.power) {
    cy.get('[data-cy=station-power-input]').clear().type(formData.power);
  }
  
  if (formData.coordinates) {
    cy.get('[data-cy=station-coordinates-input]').clear().type(formData.coordinates);
  }
  
  if (formData.totalPorts) {
    cy.get('[data-cy=station-total-ports-input]').clear().type(formData.totalPorts);
  }
});

When('I submit the form', () => {
  // Click the save/submit button in the form
  cy.get('[data-cy=save-station-button]').click();
});

Then('I should see a success message', () => {
  // Check for a success message/toast/notification
  cy.get('[data-cy=success-message]').should('be.visible');
  cy.contains('Estação criada com sucesso').should('be.visible');
});

Then('the new station should appear in the stations list', () => {
  // Verify that the new station appears in the table
  cy.get('table tbody tr').should('contain', 'Test Station');
});

Then('I should see validation errors', () => {
  // Check for error messages in the form
  cy.get('[data-cy=validation-error]').should('be.visible');
});
