# Implementation Plan

- [x] 1. Set up project structure and initialize backend API



  - Create Node.js/Express project with TypeScript configuration
  - Set up project folder structure (controllers, services, models, routes, middleware)
  - Configure environment variables for database, authentication, and API settings
  - Initialize PostgreSQL database connection with connection pooling
  - Set up basic error handling middleware and logging




  - _Requirements: 1.1, 1.2, 6.1, 6.3_

- [x] 2. Implement authentication system with email domain restriction


  - [ ] 2.1 Create User model and database schema
    - Write SQL migration for users table with all required fields
    - Implement User model with TypeScript interfaces
    - _Requirements: 1.1, 1.5, 6.5_
  


  - [ ] 2.2 Implement registration with email domain validation
    - Create registration endpoint that validates @array.com domain
    - Implement password hashing with bcrypt
    - Generate and send email verification codes
    - Store verification codes with expiration timestamps

    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ] 2.3 Implement login and session management
    - Create login endpoint with credential validation
    - Generate JWT tokens with user payload
    - Implement token refresh mechanism
    - Create authentication middleware for protected routes
    - _Requirements: 1.3, 1.5, 6.2, 6.3_
  
  - [x] 2.4 Implement email verification flow




    - Create verification endpoint to validate codes
    - Update user verification status upon successful verification
    - Handle expired verification codes
    - _Requirements: 1.2, 1.3_


  
  - [ ]* 2.5 Write authentication tests
    - Create unit tests for email domain validation
    - Write integration tests for registration and login flows
    - Test JWT token generation and validation


    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Implement restaurant management system
  - [ ] 3.1 Create Restaurant and MenuItem models
    - Write SQL migrations for restaurants and menu_items tables
    - Implement Restaurant and MenuItem TypeScript interfaces
    - Create database indexes for performance optimization
    - _Requirements: 2.1, 3.1_
  
  - [x] 3.2 Implement restaurant CRUD operations





    - Create endpoints for adding, updating, and deleting restaurants
    - Implement restaurant listing with active/inactive filtering
    - Add image upload functionality for restaurant images
    - Implement role-based access control for admin-only operations


    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 3.3 Implement menu management
    - Create endpoint for uploading menu items for a restaurant


    - Implement menu item CRUD operations
    - Add support for menu categories and availability status
    - Handle menu image uploads and storage
    - _Requirements: 4.3_
  

  - [-]* 3.4 Write restaurant management tests

    - Test restaurant CRUD operations
    - Verify admin authorization for protected endpoints
    - Test menu upload and retrieval
    - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [ ] 4. Implement voting system
  - [ ] 4.1 Create voting period and votes models
    - Write SQL migrations for voting_periods and votes tables
    - Implement VotingPeriod and Vote TypeScript interfaces
    - Add unique constraint for one vote per user per period
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 4.2 Implement daily voting period management
    - Create service to initialize daily voting periods




    - Implement logic to set available restaurants for each day
    - Add admin endpoint to configure voting period times
    - _Requirements: 2.1, 4.5_
  


  - [ ] 4.3 Implement vote casting and validation
    - Create endpoint for employees to cast votes
    - Validate one vote per user per voting period
    - Check voting period is active before accepting votes
    - Return appropriate error messages for duplicate votes


    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 4.4 Implement vote counting and winner determination
    - Create service to count votes for each restaurant
    - Implement winner determination logic (highest votes)


    - Handle tie-breaking scenarios
    - Update voting period with winner when period closes
    - _Requirements: 2.5, 5.1_
  
  - [ ] 4.5 Create voting results endpoints
    - Implement endpoint to get available restaurants for voting
    - Create endpoint to check if user has voted
    - Add endpoint to get live or final voting results
    - Display Restaurant of the Day after voting closes
    - _Requirements: 2.1, 2.5, 3.1, 5.1_
  





  - [ ]* 4.6 Write voting system tests
    - Test vote casting with duplicate prevention
    - Verify voting period validation
    - Test winner determination logic
    - Test tie-breaking scenarios

    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Implement ordering system
  - [ ] 5.1 Create Order and OrderItem models
    - Write SQL migrations for orders and order_items tables
    - Implement Order and OrderItem TypeScript interfaces
    - Add foreign key relationships to voting periods and restaurants
    - _Requirements: 3.2, 3.3_
  
  - [x] 5.2 Implement order creation and management





    - Create endpoint for employees to submit orders
    - Validate orders can only be placed for Restaurant of the Day
    - Store order items with quantities and customization notes
    - Calculate and store order totals
    - _Requirements: 3.2, 3.3_


  
  - [ ] 5.3 Implement group order aggregation
    - Create service to aggregate all orders for a voting period
    - Implement endpoint to retrieve group order summary
    - Display employee names with their meal selections
    - Calculate total order count and amount


    - _Requirements: 3.4, 3.5, 5.2_
  
  - [ ] 5.4 Implement order export functionality
    - Create service to format orders for restaurant submission
    - Generate order summary with item breakdown
    - Implement export endpoint for admin users


    - Support CSV or JSON format for easy sharing
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 5.5 Write ordering system tests
    - Test order creation with menu items and notes
    - Verify group order aggregation accuracy


    - Test order export formatting
    - Validate order restrictions to winning restaurant
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 6. Implement admin dashboard backend endpoints


  - [ ] 6.1 Create admin-specific endpoints
    - Implement endpoint to view all voting results with vote counts
    - Create endpoint to view complete group orders
    - Add endpoint to get daily statistics (total orders, participation rate)
    - Implement role-based middleware to restrict admin endpoints
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 6.2 Implement restaurant availability management
    - Create endpoint to set which restaurants are available for specific dates
    - Add endpoint to view restaurant availability schedule
    - Implement bulk update for weekly restaurant rotation
    - _Requirements: 4.5_
  
  - [ ]* 6.3 Write admin endpoint tests
    - Test admin authorization on protected endpoints
    - Verify voting results retrieval
    - Test order export functionality
    - Validate restaurant availability management
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Build mobile application frontend
  - [ ] 7.1 Initialize mobile app project
    - Create Flutter or React Native project with navigation setup
    - Configure app structure (screens, components, services, state management)
    - Set up API client for backend communication
    - Configure environment variables for API endpoints
    - _Requirements: 1.1, 6.1_
  
  - [ ] 7.2 Implement authentication screens
    - Create login screen with email and password inputs
    - Build registration screen with email domain validation
    - Implement email verification screen for code entry
    - Add secure token storage for session management
    - Handle authentication errors with user-friendly messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 7.3 Implement voting interface
    - Create restaurant list screen showing available options
    - Build vote button with confirmation
    - Display voting status (not voted, already voted)
    - Show live or hidden vote counts based on configuration
    - Display Restaurant of the Day after voting closes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 7.4 Implement menu and ordering screens
    - Create menu screen displaying winning restaurant's items
    - Build order form with item selection and quantity controls
    - Add text input for customization notes per item
    - Implement order review screen before submission
    - Show order confirmation after successful submission
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 7.5 Implement group order view
    - Create group order screen showing all employee orders
    - Display employee names with their meal selections
    - Show order totals and item counts
    - Add real-time updates when new orders are placed
    - _Requirements: 3.4, 3.5_
  
  - [ ] 7.6 Implement navigation and state management
    - Set up app navigation flow (login → voting → ordering)
    - Implement state management for user session and data
    - Add loading states and error handling throughout app
    - Implement logout functionality
    - _Requirements: 6.2, 6.4_
  
  - [ ]* 7.7 Write mobile app tests
    - Create widget tests for authentication screens
    - Test voting interface interactions
    - Verify order submission flow
    - Test navigation and state management
    - _Requirements: 1.1, 2.1, 3.1_

- [ ] 8. Build admin web dashboard
  - [ ] 8.1 Initialize React admin dashboard project
    - Create React project with TypeScript and routing
    - Set up UI component library (Material-UI or Ant Design)
    - Configure API client for backend communication
    - Implement authentication and protected routes
    - _Requirements: 4.1, 5.1_
  
  - [ ] 8.2 Implement restaurant management interface
    - Create restaurant list view with add/edit/delete actions
    - Build restaurant form for adding and editing details
    - Implement image upload component for restaurant images
    - Add active/inactive toggle for restaurants
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 8.3 Implement menu management interface
    - Create menu upload interface for each restaurant
    - Build menu item form with category and pricing
    - Implement bulk menu upload (CSV or JSON)
    - Add menu item availability toggle
    - _Requirements: 4.3_
  
  - [ ] 8.4 Implement voting period configuration
    - Create interface to set daily available restaurants
    - Build calendar view for scheduling restaurant availability
    - Add voting period time configuration
    - Display voting results with vote counts
    - _Requirements: 4.5, 5.1_
  
  - [ ] 8.5 Implement order management and export
    - Create order summary view showing all daily orders
    - Display group order with employee details and items
    - Implement export button to download order summary
    - Add statistics dashboard (participation rate, popular items)
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 8.6 Write admin dashboard tests
    - Test restaurant CRUD operations in UI
    - Verify menu upload functionality
    - Test order export feature
    - Validate admin authentication and authorization
    - _Requirements: 4.1, 4.2, 4.3, 5.3_

- [ ] 9. Implement security and performance optimizations
  - [ ] 9.1 Add security middleware and validation
    - Implement rate limiting on all API endpoints
    - Add input sanitization to prevent XSS attacks
    - Implement CSRF protection for state-changing operations
    - Add SQL injection prevention with parameterized queries
    - Configure CORS for allowed origins only
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [ ] 9.2 Implement caching and performance optimizations
    - Add Redis caching for restaurant and menu data
    - Implement database query optimization with proper indexes
    - Add pagination for order history and restaurant lists
    - Optimize image storage and delivery
    - _Requirements: 2.1, 3.1_
  
  - [ ]* 9.3 Perform security testing
    - Conduct penetration testing on authentication endpoints
    - Test rate limiting effectiveness
    - Verify input validation and sanitization
    - Test session management and token expiration
    - _Requirements: 6.1, 6.3, 6.5_

- [ ] 10. Integration and deployment setup
  - [ ] 10.1 Set up deployment configuration
    - Create Docker containers for backend API
    - Configure PostgreSQL database for production
    - Set up environment-specific configurations (dev, staging, prod)
    - Configure file storage (AWS S3 or Firebase Storage)
    - _Requirements: 6.3_
  
  - [ ] 10.2 Implement logging and monitoring
    - Add structured logging for all API requests and errors
    - Set up error tracking (Sentry or similar)
    - Implement health check endpoints
    - Add performance monitoring for database queries
    - _Requirements: 6.3_
  
  - [ ] 10.3 Create deployment scripts and documentation
    - Write deployment scripts for backend and database
    - Create API documentation (Swagger/OpenAPI)
    - Document environment setup and configuration
    - Create admin user guide for dashboard usage
    - _Requirements: 4.1, 5.1_
  
  - [ ]* 10.4 Perform end-to-end testing
    - Test complete user journey from login to order submission
    - Verify admin workflows for restaurant and order management
    - Test concurrent user scenarios (multiple employees voting)
    - Validate data consistency across all operations
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
