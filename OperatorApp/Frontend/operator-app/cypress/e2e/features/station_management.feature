Feature: Station Management
  As a Station Operator
  I must be able to see station statistics
  So I can make decisions on what to do

  Scenario: View all stations
    Given I am logged in as a Station Operator
    When I navigate to the stations dashboard
    Then I should see a list of all stations
    And I should see station information

  Scenario: Enable a station
    Given I am logged in as a Station Operator
    And there is a disabled station
    When I enable the station
    Then the station status should change to "online"
    And users with bookings should be notified

  Scenario: Disable a station
    Given I am logged in as a Station Operator
    And there is an enabled station
    When I disable the station
    Then the station status should change to "offline"
    And users with bookings should be notified

  Scenario: Temporarily disable a station
    Given I am logged in as a Station Operator
    And there is an enabled station
    When I disable the station for a specific time period
    Then the station status should change to "offline"
    And the station should be scheduled to re-enable automatically
    And users with bookings should be notified
