# Talabat Integration Guide

## Overview
Array Eats integrates with Talabat Bahrain's API to enable automated food ordering and delivery tracking.

## Features
- Fetch restaurants from Talabat
- Sync restaurant menus
- Place group orders automatically
- Track order status in real-time
- Cancel orders if needed

## Setup

### 1. Get Talabat API Credentials
1. Visit [Talabat Integration Portal](https://integration.talabat.com)
2. Register as a corporate partner
3. Obtain your API key and credentials
4. Note your API endpoint URL

### 2. Configure Environment Variables
Add the following to your `.env` file:

```env
# Talabat Integration
TALABAT_API_KEY=your_actual_api_key_here
TALABAT_API_URL=https://api.talabat.com/v1
TALABAT_ENABLED=true

# Company Delivery Address
COMPANY_DELIVERY_STREET=Array Office Building
COMPANY_DELIVERY_BUILDING=Building 123
COMPANY_DELIVERY_FLOOR=5
COMPANY_DELIVERY_CITY=Manama
COMPANY_DELIVERY_AREA=Seef
COMPANY_DELIVERY_PHONE=+973-1234-5678
```

### 3. Database Migration
The database schema has been updated to support Talabat integration:
- `restaurants.talabat_restaurant_id` - Links to Talabat restaurant
- `menu_items.talabat_item_id` - Links to Talabat menu items
- `orders.talabat_order_id` - Tracks Talabat order ID
- `orders.talabat_tracking_url` - Order tracking URL

Run migrations:
```bash
npm run migrate
```

## API Endpoints

### Check Integration Status
```http
GET /api/talabat/status
Authorization: Bearer <token>
```

### Get Talabat Restaurants (Admin)
```http
GET /api/talabat/restaurants?city=Manama&cuisine=Italian
Authorization: Bearer <admin-token>
```

### Get Restaurant Menu from Talabat (Admin)
```http
GET /api/talabat/restaurants/:restaurantId/menu
Authorization: Bearer <admin-token>
```

### Sync Restaurant from Talabat (Admin)
Imports a restaurant and its menu from Talabat into Array Eats:
```http
POST /api/talabat/restaurants/sync
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "talabatRestaurantId": "talabat-restaurant-id-here"
}
```

### Place Group Order through Talabat (Admin)
Automatically places the day's group order through Talabat:
```http
POST /api/talabat/orders/place-group
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "talabatRestaurantId": "talabat-restaurant-id",
  "paymentMethod": "cash"
}
```

### Track Order Status (Admin)
```http
GET /api/talabat/orders/:orderId/status
Authorization: Bearer <admin-token>
```

## Workflow

### Daily Workflow with Talabat Integration

1. **Admin syncs restaurants from Talabat** (one-time or periodic)
   ```
   POST /api/talabat/restaurants/sync
   ```

2. **Admin sets available restaurants for voting**
   ```
   POST /api/admin/restaurants/daily
   ```

3. **Employees vote** (9 AM - 11 AM)
   ```
   POST /api/voting/vote
   ```

4. **Admin closes voting**
   ```
   POST /api/voting/close
   ```

5. **Employees place orders**
   ```
   POST /api/orders
   ```

6. **Admin places group order through Talabat**
   ```
   POST /api/talabat/orders/place-group
   ```

7. **Track delivery**
   ```
   GET /api/talabat/orders/:orderId/status
   ```

## Important Notes

### Restaurant Syncing
- When syncing a restaurant from Talabat, both the restaurant and menu are imported
- The `talabat_restaurant_id` is stored for future reference
- Menu items include `talabat_item_id` for order placement

### Group Orders
- The system aggregates all employee orders into one Talabat order
- Special instructions from multiple employees are combined
- Delivery address uses the company address from environment variables

### Order Status
Order statuses are extended to include:
- `pending` - Order created in Array Eats
- `placed` - Order placed through Talabat
- `confirmed` - Talabat confirmed the order
- `delivered` - Order delivered
- `cancelled` - Order cancelled

### Payment Methods
Supported payment methods:
- `cash` - Cash on delivery
- `card` - Card payment (requires Talabat payment setup)

## Error Handling

Common errors:
- `TALABAT_NOT_CONFIGURED` - API key not set
- `TALABAT_API_ERROR` - Error from Talabat API
- `TALABAT_CONNECTION_ERROR` - Cannot connect to Talabat
- `MISSING_TALABAT_ID` - Restaurant not linked to Talabat

## Testing

### Test Integration Status
```bash
curl -X GET http://localhost:3000/api/talabat/status \
  -H "Authorization: Bearer <token>"
```

### Test Restaurant Fetch
```bash
curl -X GET "http://localhost:3000/api/talabat/restaurants?city=Manama" \
  -H "Authorization: Bearer <admin-token>"
```

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys periodically

2. **Admin-Only Access**
   - All Talabat operations require admin role
   - Regular employees cannot access Talabat endpoints

3. **Rate Limiting**
   - Talabat API has rate limits
   - Implement caching for restaurant/menu data
   - Avoid excessive API calls

## Troubleshooting

### Integration Not Working
1. Check `TALABAT_ENABLED=true` in `.env`
2. Verify API key is correct
3. Check API URL is correct
4. Review Talabat API documentation for changes

### Orders Not Placing
1. Ensure restaurant has `talabat_restaurant_id`
2. Verify menu items have `talabat_item_id`
3. Check company delivery address is complete
4. Verify payment method is supported

### Menu Sync Issues
1. Check Talabat restaurant ID is valid
2. Ensure restaurant is active on Talabat
3. Verify API permissions include menu access

## Future Enhancements

- Real-time order tracking webhooks
- Automatic menu synchronization
- Multiple delivery addresses support
- Split payment options
- Order history from Talabat
- Restaurant ratings and reviews
- Promotional codes support
