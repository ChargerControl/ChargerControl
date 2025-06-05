Feature: Add New Station
  As a Station Operator
  I must be able to add a new station to the system
  So clients have more options

  Scenario: Navigate to add station page
    Given I am logged in as a Station Operator
    When I navigate to the stations dashboard
    And I click on "Add Station" button
    Then I should see the add station form

  Scenario: Add a new station with valid information
    Given I am logged in as a Station Operator
    And I am on the add station form
    When I fill in the station information with:
      | field        | value            |
      | name         | Test Station     |
      | location     | Test Location    |
      | chargingType | AC_STANDARD      |
      | power        |               22 |
      | coordinates  | 40.6405, -8.6538 |
      | totalPorts   |                2 |
    And I submit the form
    Then I should see a success message
    And the new station should appear in the stations list

  Scenario: Attempt to add a station with invalid information
    Given I am logged in as a Station Operator
    And I am on the add station form
    When I fill in the station information with:
      | field | value |
      | name  |       |
    And I submit the form
    Then I should see validation errors
