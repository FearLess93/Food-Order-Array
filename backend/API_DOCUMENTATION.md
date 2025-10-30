# Array Eats API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@array.com",
  "password": "Password123",
  "name": "John Doe"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@array.com",
  "password": "Password123"
}
```

### Verify Email
```http
POST /auth/verify
Content-Type: application/json

{
  "email": "user@array.com",
  "code": "123456"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## Restaurant Endpoints

### Get All Restaurants
```http
GET /restaurants?active=true
Authorization: Bearer <token>
```

### Get Restaurant by ID
```http
GET /restaurants/:id
Authorization: Bearer <token>
```

### Create Restaurant (Admin)
```http
POST /restaurants
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Pizza Palace",
  "cuisine": "Italian",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Update Restaurant (Admin)
```http
PUT /restaurants/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

### Delete Restaurant (Admin)
```http
DELETE /restaurants/:id
Authorization: Bearer <admin-token>
```

---

## Menu Endpoints

### Get Restaurant Menu
```http
GET /menu/restaurant/:restaurantId?available=true
Authorization: Bearer <token>
```

### Create Menu Item (Admin)
```http
POST /menu/restaurant/:restaurantId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "imageUrl": "https://example.com/pizza.jpg"
}
```

### Bulk Upload Menu (Admin)
```http
POST /menu/restaurant/:restaurantId/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "items": [
    {
      "name": "Margherita Pizza",
      "description": "Classic",
      "price": 12.99,
      "category": "Pizza"
    },
    {
      "name": "Pepperoni Pizza",
      "description": "With pepperoni",
      "price": 14.99,
      "category": "Pizza"
    }
  ]
}
```

### Update Menu Item (Admin)
```http
PUT /menu/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 13.99,
  "isAvailable": true
}
```

---

## Voting Endpoints

### Get Available Restaurants for Voting
```http
GET /voting/available?date=2024-01-15
Authorization: Bearer <token>
```

### Cast Vote
```http
POST /voting/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "uuid-here"
}
```

### Check if User Has Voted
```http
GET /voting/has-voted?date=2024-01-15
Authorization: Bearer <token>
```

### Get Voting Results
```http
GET /voting/results?date=2024-01-15
Authorization: Bearer <token>
```

### Check if Voting is Active
```http
GET /voting/is-active?date=2024-01-15
Authorization: Bearer <token>
```

### Close Voting (Admin)
```http
POST /voting/close
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "date": "2024-01-15"
}
```

---

## Order Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "uuid-here",
  "items": [
    {
      "menuItemId": "uuid-here",
      "quantity": 2,
      "notes": "No onions"
    },
    {
      "menuItemId": "uuid-here",
      "quantity": 1
    }
  ]
}
```

### Get User's Orders
```http
GET /orders/my-orders
Authorization: Bearer <token>
```

### Get Group Order
```http
GET /orders/group?date=2024-01-15
Authorization: Bearer <token>
```

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Cancel Order
```http
DELETE /orders/:id
Authorization: Bearer <token>
```

### Export Orders (Admin)
```http
GET /orders/export/download?date=2024-01-15&format=csv
Authorization: Bearer <admin-token>
```
Formats: `text`, `csv`, `json`

---

## Admin Endpoints

### Get Daily Statistics
```http
GET /admin/stats/daily?date=2024-01-15
Authorization: Bearer <admin-token>
```

### Get System Overview
```http
GET /admin/stats/overview
Authorization: Bearer <admin-token>
```

### Get Voting Results (Admin View)
```http
GET /admin/voting/results?date=2024-01-15
Authorization: Bearer <admin-token>
```

### Get Group Order (Admin View)
```http
GET /admin/orders/group?date=2024-01-15
Authorization: Bearer <admin-token>
```

### Set Daily Restaurants
```http
POST /admin/restaurants/daily
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "restaurantIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Get Daily Restaurants
```http
GET /admin/restaurants/daily?date=2024-01-15
Authorization: Bearer <admin-token>
```

### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin-token>
```

### Update User Role
```http
PUT /admin/users/:userId/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "admin"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Common Error Codes

- `UNAUTHORIZED` - Authentication required
- `INVALID_TOKEN` - Token is invalid or expired
- `EMAIL_NOT_VERIFIED` - Email verification required
- `INVALID_EMAIL_DOMAIN` - Only @array.com emails allowed
- `ALREADY_VOTED` - User has already voted today
- `VOTING_ENDED` - Voting period has closed
- `ORDER_ALREADY_EXISTS` - User already placed an order today
- `NOT_WINNING_RESTAURANT` - Can only order from winning restaurant
- `ADMIN_ACCESS_REQUIRED` - Admin privileges required
- `RESTAURANT_NOT_FOUND` - Restaurant doesn't exist
- `MENU_ITEM_NOT_FOUND` - Menu item doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Workflow Example

### Daily Workflow

1. **Admin sets available restaurants** (morning)
   ```
   POST /admin/restaurants/daily
   ```

2. **Employees view available restaurants**
   ```
   GET /voting/available
   ```

3. **Employees cast votes** (9 AM - 11 AM)
   ```
   POST /voting/vote
   ```

4. **Admin closes voting** (11 AM)
   ```
   POST /voting/close
   ```

5. **Employees view winning restaurant menu**
   ```
   GET /menu/restaurant/:restaurantId
   ```

6. **Employees place orders**
   ```
   POST /orders
   ```

7. **Employees view group order**
   ```
   GET /orders/group
   ```

8. **Admin exports orders for restaurant**
   ```
   GET /orders/export/download?format=csv
   ```
