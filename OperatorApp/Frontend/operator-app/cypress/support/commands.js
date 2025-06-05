// ***********************************************
// This file contains custom commands for Cypress
// For more comprehensive examples of custom commands:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Custom commands go here --

// Command to stub station API responses
Cypress.Commands.add('stubStationApis', () => {
  // Stub GET stations
  cy.intercept('GET', 'http://localhost:8081/apiV1/stations', { 
    fixture: 'stations.json' 
  }).as('getStations');
  
  // Stub POST for creating new station
  cy.intercept('POST', 'http://localhost:8081/apiV1/stations', (req) => {
    const newStation = req.body;
    newStation.id = 999; // Assign a test ID
    return {
      statusCode: 201,
      body: newStation
    };
  }).as('createStation');
  
  // Stub PUT for updating station status
  cy.intercept('PUT', 'http://localhost:8081/apiV1/stations/*/toggle', (req) => {
    const stationId = req.url.split('/').slice(-2)[0];
    return {
      statusCode: 200,
      body: {
        id: parseInt(stationId),
        available: req.body.available
      }
    };
  }).as('toggleStation');
  
  // Stub GET for charging ports
  cy.intercept('GET', 'http://localhost:8081/apiV1/chargingports/station/*', {
    body: [
      {
        "id": 1,
        "identifier": "Port-1",
        "status": "AVAILABLE",
        "energyUsed": 0.0,
        "stationId": 1
      },
      {
        "id": 2,
        "identifier": "Port-2",
        "status": "OCCUPIED",
        "energyUsed": 10.5,
        "stationId": 1
      }
    ]
  }).as('getChargingPorts');
});
