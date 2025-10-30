# Requirements Document

## Introduction

Array Eats is an internal mobile application designed exclusively for Array employees to simplify the process of choosing and ordering food as a team. The system enables employees to vote for restaurants, decide on group orders, and track delivery within a secure company-only environment. This MVP focuses on core functionality including authentication, restaurant voting, menu ordering, and basic administration.

## Glossary

- **Array Eats System**: The complete mobile and web application platform for food ordering
- **Employee User**: A verified Array company employee with an @array.com email address
- **Admin User**: HR or Office Management team member with elevated privileges
- **Restaurant of the Day**: The restaurant that receives the highest number of votes in a voting period
- **Voting Period**: The time window during which employees can cast votes for restaurants
- **Group Order**: The collective set of individual meal orders from employees for a single restaurant
- **Order Item**: A specific meal selection with optional customization notes
- **Admin Dashboard**: Web-based interface for system administration

## Requirements

### Requirement 1

**User Story:** As an Array employee, I want to log in using my company email credentials, so that I can access the food ordering system securely.

#### Acceptance Criteria

1. WHEN an Employee User attempts to register, THE Array Eats System SHALL verify that the email address ends with "@array.world"
2. WHEN an Employee User submits valid company credentials, THE Array Eats System SHALL send a verification code to the provided email address within 30 seconds
3. WHEN an Employee User enters a valid verification code, THE Array Eats System SHALL grant access to the application
4. IF an Employee User provides an email address that does not end with "@array.com", THEN THE Array Eats System SHALL reject the registration attempt and display an error message
5. WHEN an Employee User completes email verification, THE Array Eats System SHALL create an authenticated session

### Requirement 2

**User Story:** As an Array employee, I want to view available restaurants and vote for my preferred option, so that I can participate in the daily restaurant selection.

#### Acceptance Criteria

1. WHEN an authenticated Employee User accesses the voting interface, THE Array Eats System SHALL display the list of available restaurants for the current day
2. WHEN an Employee User selects a restaurant, THE Array Eats System SHALL record one vote for that restaurant
3. THE Array Eats System SHALL allow each Employee User to cast exactly one vote per Voting Period
4. WHEN an Employee User attempts to vote a second time in the same Voting Period, THE Array Eats System SHALL prevent the duplicate vote and display a notification
5. WHEN the Voting Period ends, THE Array Eats System SHALL determine the Restaurant of the Day based on the highest vote count

### Requirement 3

**User Story:** As an Array employee, I want to view the winning restaurant's menu and place my order, so that I can select my meal for the day.

#### Acceptance Criteria

1. WHEN the Voting Period closes, THE Array Eats System SHALL display the Restaurant of the Day and its menu to all Employee Users
2. WHEN an Employee User selects menu items, THE Array Eats System SHALL allow the user to add customization notes for each Order Item
3. WHEN an Employee User submits their order, THE Array Eats System SHALL add the order to the Group Order
4. THE Array Eats System SHALL display the Group Order summary to all Employee Users
5. WHEN an Employee User views the Group Order, THE Array Eats System SHALL show all submitted orders with employee names and meal selections

### Requirement 4

**User Story:** As an admin user, I want to manage restaurants and menus through a dashboard, so that I can control the daily restaurant options available to employees.

#### Acceptance Criteria

1. WHEN an Admin User accesses the Admin Dashboard, THE Array Eats System SHALL display options to add, edit, or remove restaurants
2. WHEN an Admin User adds a restaurant, THE Array Eats System SHALL store the restaurant information and make it available for voting
3. WHEN an Admin User uploads a menu for a restaurant, THE Array Eats System SHALL associate the menu with that restaurant
4. WHEN an Admin User removes a restaurant, THE Array Eats System SHALL exclude it from future voting periods
5. THE Array Eats System SHALL allow Admin Users to set which restaurants are available for each Voting Period

### Requirement 5

**User Story:** As an admin user, I want to view voting results and order summaries, so that I can coordinate the food order with the restaurant.

#### Acceptance Criteria

1. WHEN an Admin User accesses the voting results, THE Array Eats System SHALL display the vote count for each restaurant
2. WHEN the Voting Period ends, THE Array Eats System SHALL display the complete Group Order to Admin Users
3. WHEN an Admin User requests an order export, THE Array Eats System SHALL generate a formatted summary containing all Order Items with employee names and customization notes
4. THE Array Eats System SHALL allow Admin Users to download the order export in a readable format
5. WHEN an Admin User views the Group Order, THE Array Eats System SHALL display the total number of orders and individual meal selections

### Requirement 6

**User Story:** As an Array employee, I want the system to be secure and only accessible to verified company employees, so that our internal ordering process remains private.

#### Acceptance Criteria

1. THE Array Eats System SHALL restrict all application features to authenticated Employee Users
2. WHEN an unauthenticated user attempts to access any feature, THE Array Eats System SHALL redirect to the login screen
3. THE Array Eats System SHALL maintain secure session management for all authenticated users
4. WHEN an Employee User logs out, THE Array Eats System SHALL terminate the session and require re-authentication for future access
5. THE Array Eats System SHALL encrypt all authentication credentials during transmission and storage
