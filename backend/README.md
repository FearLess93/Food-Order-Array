# Array Eats Backend API

Backend API for the Array Eats food ordering application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and configuration.

4. Create the PostgreSQL database:
```bash
createdb array_eats
```

5. Run database migrations:
```bash
npm run build
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Authentication (Coming soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email
- `POST /api/auth/logout` - Logout user

### Restaurants (Coming soon)
- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant (admin)
- `PUT /api/restaurants/:id` - Update restaurant (admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (admin)

### Voting (Coming soon)
- `GET /api/voting/available` - Get available restaurants for voting
- `POST /api/voting/vote` - Cast vote
- `GET /api/voting/results` - Get voting results

### Orders (Coming soon)
- `GET /api/orders/menu/:restaurantId` - Get restaurant menu
- `POST /api/orders` - Create order
- `GET /api/orders/group` - Get group order summary

### Admin (Coming soon)
- `GET /api/admin/votes` - View voting results
- `GET /api/admin/orders` - View all orders
- `POST /api/admin/orders/export` - Export orders

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── database/        # Database migrations
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript
├── .env                 # Environment variables
└── package.json
```
