# Requirements Document

## Introduction

The Array Food Ordering System is a closed, internal web application designed exclusively for Array Innovation employees to coordinate group food orders. The system enables employees to create food ordering groups tied to specific restaurants, collaborate through real-time chat, manage individual carts within groups, and track payment confirmations. The application enforces domain-restricted registration (@array.world), supports both public and private groups, and provides group owners with administrative controls for payment tracking and group lifecycle management.

## Glossary

- **System**: The Array Food Ordering web application
- **User**: An authenticated employee with an @array.world email address
- **Group Owner**: The User who created a specific Group and has administrative permissions for that Group
- **Group**: A food ordering session tied to a single Restaurant with a defined duration
- **Public Group**: A Group visible and joinable by all Users without a join code
- **Private Group**: A Group requiring a join code to join
- **Join Code**: An 8-character random alphanumeric string required to join a Private Group
- **Restaurant**: A food establishment with an associated menu
- **Menu Item**: A food or beverage item available for ordering from a Restaurant
- **Cart**: A User's collection of Menu Items within a specific Group
- **Group Duration**: The time period during which a Group accepts new members and cart modifications
- **Payment Status**: The confirmation state of a User's payment within a Group (paid/unpaid/pending)
- **Dashboard**: The main landing page displaying available Groups and navigation options

## Requirements

### Requirement 1: Domain-Restricted Registration

**User Story:** As an Array Innovation employee, I want to register using my company email address, so that only authorized employees can access the food ordering system.

#### Acceptance Criteria

1. WHEN a User submits a registration form, THE System SHALL validate that the email address ends with "@array.world"
2. IF the email address does not end with "@array.world", THEN THE System SHALL reject the registration and display an error message stating "Registration is restricted to @array.world email addresses"
3. WHEN a User successfully registers with a valid @array.world email, THE System SHALL create a User account without requiring manual verification
4. THE System SHALL allow the User to log in immediately after successful registration
5. THE System SHALL store the User's hashed password using a secure hashing algorithm with a minimum of 10 salt rounds

### Requirement 2: Authentication and Session Management

**User Story:** As a User, I want to securely log in and maintain my session, so that I can access the application without repeatedly entering credentials.

#### Acceptance Criteria

1. WHEN a User submits valid login credentials, THE System SHALL generate a JWT token or secure session cookie with an expiration time of 24 hours
2. THE System SHALL include authentication tokens in HTTP-only cookies to prevent XSS attacks
3. WHEN a User requests a password reset, THE System SHALL send a password reset link to the User's registered email address with a token valid for 1 hour
4. THE System SHALL invalidate the password reset token after successful password change or after 1 hour expiration
5. THE System SHALL implement rate limiting of 5 failed login attempts per email address within a 15-minute window

### Requirement 3: Dashboard Display

**User Story:** As a User, I want to view all available groups and my memberships on the dashboard, so that I can quickly find and join food ordering groups.

#### Acceptance Criteria

1. WHEN a User accesses the Dashboard, THE System SHALL display all Public Groups with their Restaurant name, Group Owner name, status, and remaining time
2. THE System SHALL provide a search filter allowing Users to filter Groups by Restaurant name, Group Owner name, or status
3. THE System SHALL display a "Create Group" button that navigates to the Group creation form
4. THE System SHALL provide a toggle or filter to display only Groups where the User is a member
5. THE System SHALL update the remaining time display for each Group every 60 seconds without requiring page refresh

### Requirement 4: Group Creation

**User Story:** As a User, I want to create a food ordering group with specific settings, so that I can coordinate orders with my colleagues.

#### Acceptance Criteria

1. WHEN a User submits the Group creation form, THE System SHALL create a new Group with the User as the Group Owner
2. THE System SHALL require the User to provide a Group name with a minimum length of 3 characters and maximum length of 100 characters
3. THE System SHALL require the User to select a Restaurant from a predefined list of available Restaurants
4. WHEN a User selects "Private" status, THE System SHALL generate an 8-character random alphanumeric Join Code and display it to the User
5. THE System SHALL require the User to specify a Group Duration between 15 minutes and 24 hours
6. WHERE a maximum member limit is specified, THE System SHALL enforce this limit when Users attempt to join the Group

### Requirement 5: Public Group Joining

**User Story:** As a User, I want to join public groups without barriers, so that I can participate in open food orders.

#### Acceptance Criteria

1. WHEN a User clicks "Join" on a Public Group, THE System SHALL add the User to the Group's member list
2. THE System SHALL prevent a User from joining the same Group more than once
3. WHILE the Group Duration has not expired, THE System SHALL allow Users to join the Public Group
4. IF the Group has reached its maximum member limit, THEN THE System SHALL prevent additional Users from joining and display a message stating "Group is full"
5. WHEN a User successfully joins a Group, THE System SHALL navigate the User to the Group page

### Requirement 6: Private Group Joining

**User Story:** As a User, I want to join private groups using a join code, so that I can participate in restricted food orders.

#### Acceptance Criteria

1. WHEN a User enters a Join Code for a Private Group, THE System SHALL validate the code against existing Private Groups
2. IF the Join Code is invalid, THEN THE System SHALL display an error message stating "Invalid join code"
3. WHEN a User submits a valid Join Code, THE System SHALL add the User to the Private Group's member list
4. THE System SHALL allow the Group Owner to view and copy the Join Code at any time
5. WHILE the Group Duration has not expired, THE System SHALL allow Users to join the Private Group using the Join Code

### Requirement 7: Menu Display and Item Selection

**User Story:** As a Group member, I want to browse the restaurant's menu and add items to my cart, so that I can order food.

#### Acceptance Criteria

1. WHEN a User views the Menu tab, THE System SHALL display all Menu Items for the Group's Restaurant including name, description, price, and dietary tags
2. WHEN a User clicks "Add to Cart" on a Menu Item, THE System SHALL add the item to the User's Cart within that Group
3. THE System SHALL allow Users to specify quantity when adding Menu Items with a minimum of 1 and maximum of 99
4. THE System SHALL display Menu Items with dietary tags (vegetarian, vegan, gluten-free, halal) when available
5. WHILE the Group is open, THE System SHALL allow Users to add Menu Items to their Cart

### Requirement 8: Real-Time Chat

**User Story:** As a Group member, I want to chat with other members in real-time, so that I can coordinate the food order.

#### Acceptance Criteria

1. WHEN a User sends a message in the Chat tab, THE System SHALL broadcast the message to all Group members in real-time using WebSockets
2. THE System SHALL display each message with the sender's name and timestamp in HH:MM format
3. WHEN a User is typing, THE System SHALL display a typing indicator to other Group members
4. THE System SHALL limit message length to 500 characters
5. THE System SHALL sanitize all chat messages to prevent XSS attacks by escaping HTML special characters

### Requirement 9: Cart Management and Display

**User Story:** As a Group member, I want to view all cart items and manage my own items, so that I can track what everyone is ordering.

#### Acceptance Criteria

1. WHEN a User views the Cart tab, THE System SHALL display all Cart Items grouped by User with item name, price, quantity, and subtotal
2. THE System SHALL calculate and display each User's subtotal and the Group's total amount
3. THE System SHALL allow Users to delete only their own Cart Items
4. WHEN a User deletes a Cart Item, THE System SHALL update the Cart display in real-time for all Group members
5. WHILE the Group is open, THE System SHALL allow Users to modify their Cart Items

### Requirement 10: Group Duration and Closure

**User Story:** As a Group Owner, I want the group to automatically close after the duration expires, so that orders can be finalized.

#### Acceptance Criteria

1. WHEN the Group Duration expires, THE System SHALL automatically set the Group status to "closed"
2. WHEN a Group is closed, THE System SHALL prevent new Users from joining
3. WHEN a Group is closed, THE System SHALL prevent all Users from adding or removing Cart Items
4. WHEN a Group is closed, THE System SHALL display the payment tracking interface to the Group Owner
5. THE System SHALL allow Group members to continue viewing the Menu, Chat, and Cart tabs after closure

### Requirement 11: Payment Tracking and Confirmation

**User Story:** As a Group Owner, I want to track which members have paid, so that I can ensure all payments are collected before closing the order.

#### Acceptance Criteria

1. WHEN a Group is closed, THE System SHALL display a payment status interface showing all Group members and their Payment Status
2. THE System SHALL allow the Group Owner to mark each member's Payment Status as "paid" or "unpaid"
3. THE System SHALL allow Group members to view their own Payment Status
4. WHERE all Group members have Payment Status marked as "paid", THE System SHALL enable the "Delete Group" button for the Group Owner
5. THE System SHALL create an audit log entry when the Group Owner changes a member's Payment Status

### Requirement 12: Group Deletion

**User Story:** As a Group Owner, I want to delete the group after all payments are confirmed, so that the dashboard remains clean and organized.

#### Acceptance Criteria

1. WHEN all Group members have Payment Status "paid", THE System SHALL display a "Delete Group" button to the Group Owner
2. WHEN the Group Owner clicks "Delete Group", THE System SHALL prompt for confirmation before deletion
3. WHEN the Group Owner confirms deletion, THE System SHALL archive the Group data including all Cart Items, messages, and payment confirmations
4. THE System SHALL remove the deleted Group from the Dashboard display for all Users
5. THE System SHALL create an audit log entry recording the Group deletion with timestamp and Group Owner identifier

### Requirement 13: Authorization and Permissions

**User Story:** As the System, I want to enforce role-based permissions, so that users can only perform actions they are authorized for.

#### Acceptance Criteria

1. THE System SHALL allow only the Group Owner to view the Private Group's Join Code
2. THE System SHALL allow only the Group Owner to mark Payment Status for Group members
3. THE System SHALL allow only the Group Owner to delete the Group
4. THE System SHALL allow Users to delete only their own Cart Items
5. THE System SHALL prevent all modifications to Cart Items when the Group is closed

### Requirement 14: Input Validation and Security

**User Story:** As the System, I want to validate all user inputs and prevent security vulnerabilities, so that the application remains secure.

#### Acceptance Criteria

1. THE System SHALL validate all email addresses using RFC 5322 standard format validation
2. THE System SHALL enforce password requirements of minimum 8 characters including at least one uppercase letter, one lowercase letter, one number, and one special character
3. THE System SHALL sanitize all user-generated content in chat messages by escaping HTML special characters before storage and display
4. THE System SHALL implement CSRF protection on all state-changing requests
5. THE System SHALL validate that Menu Item prices match the Restaurant's menu data before adding to Cart

### Requirement 15: Responsive Design

**User Story:** As a User, I want to access the application on any device, so that I can order food from my phone or computer.

#### Acceptance Criteria

1. THE System SHALL render all pages with responsive layouts that adapt to viewport widths from 320px to 2560px
2. THE System SHALL display the Group page tabs (Menu, Chat, Cart) with sticky navigation on mobile devices
3. THE System SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels on mobile devices
4. THE System SHALL optimize images and assets for mobile network conditions with maximum file sizes of 500KB per image
5. THE System SHALL maintain functionality and readability across Chrome, Firefox, Safari, and Edge browsers

### Requirement 16: Real-Time Updates

**User Story:** As a Group member, I want to see live updates when others add items or send messages, so that I stay informed about the order status.

#### Acceptance Criteria

1. WHEN a Group member adds a Cart Item, THE System SHALL broadcast the update to all Group members within 1 second using WebSockets
2. WHEN a Group member sends a chat message, THE System SHALL deliver the message to all Group members within 1 second
3. WHEN a Group member deletes a Cart Item, THE System SHALL update the Cart display for all Group members within 1 second
4. THE System SHALL automatically reconnect WebSocket connections if disconnected within 5 seconds
5. THE System SHALL display a connection status indicator when WebSocket connection is lost

### Requirement 17: Audit Logging

**User Story:** As a System Administrator, I want to track major actions in the system, so that I can monitor usage and troubleshoot issues.

#### Acceptance Criteria

1. WHEN a User creates a Group, THE System SHALL create an audit log entry with User identifier, Group identifier, Restaurant identifier, and timestamp
2. WHEN a User joins a Group, THE System SHALL create an audit log entry with User identifier, Group identifier, and timestamp
3. WHEN a User adds or removes a Cart Item, THE System SHALL create an audit log entry with User identifier, Group identifier, Menu Item identifier, action type, and timestamp
4. WHEN a Group Owner confirms a Payment Status, THE System SHALL create an audit log entry with Group Owner identifier, User identifier, Payment Status, and timestamp
5. WHEN a Group Owner deletes a Group, THE System SHALL create an audit log entry with Group Owner identifier, Group identifier, total amount, and timestamp

### Requirement 18: Data Persistence and Integrity

**User Story:** As the System, I want to ensure data consistency and prevent data loss, so that users can trust the application.

#### Acceptance Criteria

1. THE System SHALL use database transactions for all operations that modify multiple related records
2. THE System SHALL enforce foreign key constraints between Users, Groups, Carts, and Cart Items
3. THE System SHALL prevent deletion of Restaurants that have associated Groups
4. THE System SHALL maintain referential integrity between Menu Items and Cart Items
5. THE System SHALL perform database backups daily at 2:00 AM UTC with retention of 30 days
