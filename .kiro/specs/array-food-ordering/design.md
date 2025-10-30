# Design Document

## Overview

The Array Food Ordering System is a full-stack web application built with a modern tech stack optimized for real-time collaboration and responsive user experience. The system follows a three-tier architecture with a React frontend, Node.js/Express backend, and PostgreSQL database, connected via WebSocket for real-time features.

### Design Principles

1. **Security First**: Domain-restricted access, secure authentication, input validation, and XSS prevention
2. **Real-Time Collaboration**: WebSocket-based live updates for chat and cart modifications
3. **Mobile-First Responsive**: Optimized for both desktop and mobile experiences
4. **Role-Based Access**: Clear separation between User and Group Owner permissions
5. **Data Integrity**: Transactional operations and referential integrity constraints

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   React SPA (Vite)                               │  │
│  │   - React Router for navigation                  │  │
│  │   - Zustand for state management                 │  │
│  │   - Socket.IO Client for real-time               │  │
│  │   - Tailwind CSS for styling                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS / WSS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Node.js + Express API Server                   │  │
│  │   - RESTful API endpoints                        │  │
│  │   - JWT authentication middleware                │  │
│  │   - Socket.IO Server for WebSockets              │  │
│  │   - Input validation & sanitization              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ TCP
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │   PostgreSQL Database                            │  │
│  │   - Prisma ORM for type-safe queries             │  │
│  │   - Transactional operations                     │  │
│  │   - Foreign key constraints                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- React Router v6 for routing
- Zustand for state management
- Socket.IO Client for WebSockets
- Tailwind CSS for styling
- Axios for HTTP requests
- React Hook Form for form handling
- date-fns for date manipulation

**Backend:**
- Node.js 20 LTS
- Express.js for REST API
- TypeScript for type safety
- Prisma ORM for database access
- Socket.IO for WebSocket server
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- helmet for security headers
- express-rate-limit for rate limiting

**Database:**
- PostgreSQL 15
- Prisma migrations for schema management

**DevOps:**
- Docker & Docker Compose for containerization
- Jest for unit testing
- Playwright for E2E testing
- ESLint & Prettier for code quality

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**LoginPage**
- Purpose: User authentication
- Props: None
- State: email, password, error, loading
- Features:
  - Email/password form with validation
  - "Forgot Password" link
  - Error message display
  - Redirect to dashboard on success

**RegisterPage**
- Purpose: New user registration
- Props: None
- State: name, email, password, confirmPassword, error, loading
- Features:
  - Registration form with @array.world validation
  - Password strength indicator
  - Immediate login after registration
  - Domain restriction error handling

**ForgotPasswordPage**
- Purpose: Password reset request
- Props: None
- State: email, success, error, loading
- Features:
  - Email input with validation
  - Success message display
  - Link to login page

**ResetPasswordPage**
- Purpose: Set new password with token
- Props: token (from URL)
- State: password, confirmPassword, error, loading
- Features:
  - New password form
  - Token validation
  - Redirect to login on success

#### 2. Dashboard Components

**Dashboard**
- Purpose: Main landing page
- Props: None
- State: groups, filter, searchTerm, loading
- Features:
  - Public groups grid display
  - Search and filter controls
  - "Create Group" button
  - "My Groups" toggle
  - Real-time group status updates

**GroupCard**
- Purpose: Display group summary
- Props: group (Group object)
- State: timeRemaining
- Features:
  - Restaurant logo and name
  - Group owner name
  - Status badge (open/closed)
  - Countdown timer
  - Join button
  - Member count display

**CreateGroupModal**
- Purpose: Group creation form
- Props: isOpen, onClose, onSuccess
- State: formData, restaurants, error, loading
- Features:
  - Group name input
  - Restaurant selection dropdown
  - Public/Private toggle
  - Join code display (for private)
  - Duration picker
  - Max members input (optional)

**JoinPrivateGroupModal**
- Purpose: Join private group with code
- Props: isOpen, onClose, onSuccess
- State: joinCode, error, loading
- Features:
  - Join code input
  - Code validation
  - Error message display

#### 3. Group Page Components

**GroupPage**
- Purpose: Main group interface
- Props: groupId (from URL)
- State: group, activeTab, loading
- Features:
  - Group header with restaurant info
  - Countdown timer
  - Tab navigation (Menu/Chat/Cart)
  - Member list sidebar
  - Status indicators

**MenuTab**
- Purpose: Display restaurant menu
- Props: restaurantId, groupId, isOpen
- State: menuItems, categories, selectedCategory
- Features:
  - Category filter
  - Menu item cards with details
  - Add to cart button
  - Quantity selector
  - Dietary tag badges
  - Search functionality

**MenuItemCard**
- Purpose: Display single menu item
- Props: item (MenuItem), onAddToCart, disabled
- State: quantity
- Features:
  - Item image
  - Name and description
  - Price display
  - Dietary tags
  - Quantity selector
  - Add to cart button

**ChatTab**
- Purpose: Real-time group chat
- Props: groupId, currentUserId
- State: messages, newMessage, typingUsers
- Features:
  - Message list with auto-scroll
  - Message input with character count
  - Typing indicators
  - Timestamp display
  - User name display
  - WebSocket connection status

**CartTab**
- Purpose: Display all cart items
- Props: groupId, currentUserId, isOwner, isClosed
- State: cartItems, groupedByUser, totals
- Features:
  - Items grouped by user
  - User subtotals
  - Group total
  - Delete item button (own items only)
  - Payment status display (when closed)
  - Real-time updates

**PaymentTrackingPanel**
- Purpose: Owner payment management
- Props: groupId, members
- State: paymentStatuses, allPaid
- Features:
  - Member list with payment checkboxes
  - Mark paid/unpaid buttons
  - Delete group button (when all paid)
  - Payment confirmation modal

### Backend API Endpoints

#### Authentication Endpoints

```
POST /api/auth/register
Body: { name, email, password }
Response: { user, token }
Description: Register new user with @array.world email

POST /api/auth/login
Body: { email, password }
Response: { user, token }
Description: Authenticate user and return JWT

POST /api/auth/forgot-password
Body: { email }
Response: { message }
Description: Send password reset email

POST /api/auth/reset-password
Body: { token, password }
Response: { message }
Description: Reset password with token

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
Description: Get current user profile
```

#### Group Endpoints

```
GET /api/groups
Headers: Authorization: Bearer <token>
Query: ?status=open&search=pizza&myGroups=true
Response: { groups: Group[] }
Description: Get all groups with filters

POST /api/groups
Headers: Authorization: Bearer <token>
Body: { name, restaurantId, status, duration, maxMembers }
Response: { group, joinCode? }
Description: Create new group

GET /api/groups/:id
Headers: Authorization: Bearer <token>
Response: { group }
Description: Get group details

POST /api/groups/:id/join
Headers: Authorization: Bearer <token>
Body: { joinCode? }
Response: { membership }
Description: Join group (with code if private)

DELETE /api/groups/:id
Headers: Authorization: Bearer <token>
Response: { message }
Description: Delete group (owner only, all paid)
```

#### Restaurant & Menu Endpoints

```
GET /api/restaurants
Response: { restaurants: Restaurant[] }
Description: Get all restaurants

GET /api/restaurants/:id/menu
Response: { menuItems: MenuItem[] }
Description: Get restaurant menu
```

#### Cart Endpoints

```
GET /api/groups/:groupId/cart
Headers: Authorization: Bearer <token>
Response: { cartItems: CartItem[], totals }
Description: Get all cart items for group

POST /api/groups/:groupId/cart
Headers: Authorization: Bearer <token>
Body: { menuItemId, quantity }
Response: { cartItem }
Description: Add item to cart

DELETE /api/cart-items/:id
Headers: Authorization: Bearer <token>
Response: { message }
Description: Delete cart item (own items only)
```

#### Payment Endpoints

```
GET /api/groups/:groupId/payments
Headers: Authorization: Bearer <token>
Response: { payments: Payment[] }
Description: Get payment statuses

PUT /api/groups/:groupId/payments/:userId
Headers: Authorization: Bearer <token>
Body: { status: 'paid' | 'unpaid' }
Response: { payment }
Description: Update payment status (owner only)
```

#### Chat Endpoints

```
GET /api/groups/:groupId/messages
Headers: Authorization: Bearer <token>
Query: ?limit=50&before=<messageId>
Response: { messages: Message[] }
Description: Get chat messages with pagination
```

### WebSocket Events

#### Client → Server Events

```
join-group
Payload: { groupId, userId }
Description: Join group room for real-time updates

leave-group
Payload: { groupId, userId }
Description: Leave group room

send-message
Payload: { groupId, userId, text }
Description: Send chat message

typing-start
Payload: { groupId, userId, userName }
Description: User started typing

typing-stop
Payload: { groupId, userId }
Description: User stopped typing

cart-updated
Payload: { groupId, userId, action, item }
Description: Cart item added/removed
```

#### Server → Client Events

```
message-received
Payload: { message: Message }
Description: New chat message

user-typing
Payload: { userId, userName }
Description: User is typing

user-stopped-typing
Payload: { userId }
Description: User stopped typing

cart-updated
Payload: { cartItems, totals }
Description: Cart state changed

group-closed
Payload: { groupId }
Description: Group duration expired

payment-updated
Payload: { userId, status }
Description: Payment status changed

group-deleted
Payload: { groupId }
Description: Group was deleted
```

## Data Models

### Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  ownedGroups   Group[]   @relation("GroupOwner")
  memberships   GroupMember[]
  carts         Cart[]
  messages      Message[]
  payments      Payment[]
  auditLogs     AuditLog[]
}

model Restaurant {
  id          String      @id @default(uuid())
  name        String
  description String?
  logoUrl     String?
  createdAt   DateTime    @default(now())
  
  menuItems   MenuItem[]
  groups      Group[]
}

model MenuItem {
  id            String      @id @default(uuid())
  restaurantId  String
  name          String
  description   String?
  price         Decimal     @db.Decimal(10, 2)
  tags          String[]    // ['vegetarian', 'vegan', 'gluten-free', 'halal']
  imageUrl      String?
  createdAt     DateTime    @default(now())
  
  restaurant    Restaurant  @relation(fields: [restaurantId], references: [id])
  cartItems     CartItem[]
  
  @@index([restaurantId])
}

model Group {
  id            String      @id @default(uuid())
  ownerId       String
  restaurantId  String
  name          String
  status        GroupStatus // PUBLIC, PRIVATE
  joinCode      String?     @unique
  startAt       DateTime    @default(now())
  endAt         DateTime
  isClosed      Boolean     @default(false)
  maxMembers    Int?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  owner         User        @relation("GroupOwner", fields: [ownerId], references: [id])
  restaurant    Restaurant  @relation(fields: [restaurantId], references: [id])
  members       GroupMember[]
  carts         Cart[]
  messages      Message[]
  payments      Payment[]
  auditLogs     AuditLog[]
  
  @@index([ownerId])
  @@index([restaurantId])
  @@index([status])
  @@index([isClosed])
}

enum GroupStatus {
  PUBLIC
  PRIVATE
}

model GroupMember {
  id        String    @id @default(uuid())
  groupId   String
  userId    String
  joinedAt  DateTime  @default(now())
  
  group     Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id])
  
  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
}

model Cart {
  id        String      @id @default(uuid())
  groupId   String
  userId    String
  createdAt DateTime    @default(now())
  
  group     Group       @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id])
  items     CartItem[]
  
  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
}

model CartItem {
  id          String    @id @default(uuid())
  cartId      String
  menuItemId  String
  quantity    Int       @default(1)
  addedAt     DateTime  @default(now())
  
  cart        Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  
  @@index([cartId])
  @@index([menuItemId])
}

model Message {
  id        String    @id @default(uuid())
  groupId   String
  userId    String
  text      String    @db.VarChar(500)
  createdAt DateTime  @default(now())
  
  group     Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id])
  
  @@index([groupId])
  @@index([userId])
  @@index([createdAt])
}

model Payment {
  id                  String        @id @default(uuid())
  groupId             String
  userId              String
  status              PaymentStatus @default(UNPAID)
  confirmedByOwner    Boolean       @default(false)
  confirmedAt         DateTime?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  
  group               Group         @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user                User          @relation(fields: [userId], references: [id])
  
  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
}

enum PaymentStatus {
  UNPAID
  PENDING
  PAID
}

model AuditLog {
  id          String    @id @default(uuid())
  userId      String?
  groupId     String?
  action      String    // 'CREATE_GROUP', 'JOIN_GROUP', 'ADD_CART_ITEM', etc.
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
  
  user        User?     @relation(fields: [userId], references: [id])
  group       Group?    @relation(fields: [groupId], references: [id])
  
  @@index([userId])
  @@index([groupId])
  @@index([action])
  @@index([createdAt])
}
```

### TypeScript Interfaces

```typescript
// Frontend types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  tags: string[];
  imageUrl?: string;
}

interface Group {
  id: string;
  ownerId: string;
  restaurantId: string;
  name: string;
  status: 'PUBLIC' | 'PRIVATE';
  joinCode?: string;
  startAt: string;
  endAt: string;
  isClosed: boolean;
  maxMembers?: number;
  owner: User;
  restaurant: Restaurant;
  memberCount: number;
  timeRemaining?: number; // milliseconds
}

interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  addedAt: string;
  menuItem: MenuItem;
  user: User;
}

interface Message {
  id: string;
  groupId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: User;
}

interface Payment {
  id: string;
  groupId: string;
  userId: string;
  status: 'UNPAID' | 'PENDING' | 'PAID';
  confirmedByOwner: boolean;
  confirmedAt?: string;
  user: User;
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable error code
    message: string,     // Human-readable error message
    details?: any        // Optional additional details
  },
  timestamp: string
}
```

### Error Codes

```typescript
// Authentication errors
'INVALID_CREDENTIALS'
'EMAIL_NOT_ALLOWED'      // Not @array.world
'EMAIL_ALREADY_EXISTS'
'INVALID_TOKEN'
'TOKEN_EXPIRED'
'RATE_LIMIT_EXCEEDED'

// Authorization errors
'UNAUTHORIZED'
'FORBIDDEN'
'NOT_GROUP_OWNER'
'NOT_GROUP_MEMBER'

// Validation errors
'INVALID_INPUT'
'MISSING_REQUIRED_FIELD'
'INVALID_EMAIL_FORMAT'
'PASSWORD_TOO_WEAK'
'MESSAGE_TOO_LONG'

// Business logic errors
'GROUP_NOT_FOUND'
'GROUP_CLOSED'
'GROUP_FULL'
'INVALID_JOIN_CODE'
'ALREADY_MEMBER'
'CANNOT_DELETE_OWN_ITEM'
'PAYMENTS_NOT_CONFIRMED'
'RESTAURANT_NOT_FOUND'
'MENU_ITEM_NOT_FOUND'

// System errors
'DATABASE_ERROR'
'WEBSOCKET_ERROR'
'INTERNAL_SERVER_ERROR'
```

### Frontend Error Handling

```typescript
// Global error boundary for React
class ErrorBoundary extends React.Component {
  // Catch rendering errors
}

// API error interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    if (error.response?.status === 403) {
      // Show forbidden message
    }
    return Promise.reject(error);
  }
);

// WebSocket error handling
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Show connection error toast
});

socket.on('disconnect', () => {
  // Show disconnected status
  // Attempt reconnection
});
```

## Testing Strategy

### Unit Tests

**Backend (Jest)**
- Authentication service tests
  - Password hashing and verification
  - JWT token generation and validation
  - Email domain validation
- Group service tests
  - Group creation logic
  - Join code generation
  - Duration calculation
  - Payment confirmation logic
- Cart service tests
  - Add/remove items
  - Total calculation
  - Authorization checks
- Validation middleware tests
  - Input sanitization
  - XSS prevention

**Frontend (Jest + React Testing Library)**
- Component rendering tests
- Form validation tests
- State management tests
- WebSocket event handling tests

### Integration Tests

**API Endpoint Tests (Supertest)**
- Authentication flow
  - Register → Login → Access protected route
- Group lifecycle
  - Create → Join → Add items → Close → Confirm payments → Delete
- Real-time features
  - Chat message delivery
  - Cart updates broadcast

### End-to-End Tests (Playwright)

**Critical User Flows**
1. User registration and login
2. Create public group and join
3. Create private group with join code
4. Add items to cart and view totals
5. Send chat messages
6. Owner confirms payments and deletes group
7. Mobile responsive behavior

### Test Coverage Goals

- Backend: 80% code coverage
- Frontend: 70% code coverage
- E2E: All critical user flows

## Security Considerations

### Authentication & Authorization

1. **Password Security**
   - bcrypt with 12 salt rounds
   - Minimum 8 characters with complexity requirements
   - Password reset tokens expire in 1 hour

2. **JWT Tokens**
   - HTTP-only cookies to prevent XSS
   - 24-hour expiration
   - Secure flag in production
   - SameSite=Strict for CSRF protection

3. **Rate Limiting**
   - 5 failed login attempts per 15 minutes
   - 100 API requests per minute per IP
   - 10 group creations per hour per user

### Input Validation & Sanitization

1. **Server-Side Validation**
   - express-validator for all inputs
   - Email format validation (RFC 5322)
   - Domain restriction (@array.world)
   - SQL injection prevention via Prisma parameterized queries

2. **XSS Prevention**
   - HTML entity encoding for chat messages
   - Content Security Policy headers
   - Sanitize all user-generated content

3. **CSRF Protection**
   - SameSite cookie attribute
   - CSRF tokens for state-changing requests

### Data Protection

1. **Encryption**
   - HTTPS/TLS for all communications
   - WSS (WebSocket Secure) for real-time
   - Encrypted database connections

2. **Access Control**
   - Role-based permissions (User, Group Owner)
   - Resource-level authorization checks
   - Audit logging for sensitive actions

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Route-based lazy loading
   - Dynamic imports for heavy components

2. **Asset Optimization**
   - Image compression and lazy loading
   - WebP format for images
   - CDN for static assets

3. **State Management**
   - Zustand for minimal re-renders
   - Memoization for expensive calculations
   - Virtual scrolling for long lists

### Backend Optimization

1. **Database Optimization**
   - Indexes on frequently queried fields
   - Connection pooling (max 20 connections)
   - Query optimization with Prisma

2. **Caching**
   - Restaurant and menu data cached in memory
   - Redis for session storage (optional)

3. **WebSocket Optimization**
   - Room-based broadcasting
   - Message throttling
   - Connection pooling

### Monitoring

1. **Metrics**
   - API response times
   - WebSocket connection count
   - Database query performance
   - Error rates

2. **Logging**
   - Structured logging (JSON format)
   - Log levels (error, warn, info, debug)
   - Audit trail for compliance

## Deployment Architecture

### Docker Compose Setup

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:4000
      - VITE_WS_URL=ws://backend:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/arrayeats
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=arrayeats
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/arrayeats
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@array.world
EMAIL_PASSWORD=your-email-password
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

## Future Enhancements

1. **Notifications**
   - Email notifications for group invites
   - Push notifications for chat messages
   - Reminder notifications before group closes

2. **Advanced Features**
   - Order history and favorites
   - Split payment calculations
   - Restaurant ratings and reviews
   - Dietary preference filters
   - Order scheduling for future dates

3. **Admin Dashboard**
   - User management
   - Restaurant management
   - Analytics and reporting
   - System health monitoring

4. **Mobile Apps**
   - React Native iOS/Android apps
   - Push notifications
   - Offline support

5. **Integrations**
   - Payment gateway integration (Stripe, PayPal)
   - Restaurant API integrations
   - Calendar integration
   - Slack/Teams notifications
