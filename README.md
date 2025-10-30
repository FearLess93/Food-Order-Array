# Array Food Ordering System

A secure, real-time food ordering platform for Array Innovation employees.

## Features

- 🔐 Domain-restricted authentication (@array.world)
- 👥 Public and private group ordering
- 💬 Real-time chat with WebSockets
- 🛒 Collaborative cart management
- 💳 Payment tracking and confirmation
- 📱 Responsive mobile-first design
- 🔒 Secure with JWT authentication and rate limiting

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client
- React Router v6

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT Authentication

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd array-food-ordering
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

3. Start with Docker Compose:
```bash
docker-compose up -d
```

Or run locally:

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start PostgreSQL (if not using Docker)
# Update DATABASE_URL in backend/.env

# Run database migrations
cd backend
npm run prisma:migrate
npm run prisma:seed

# Start backend (in backend directory)
npm run dev

# Start frontend (in frontend directory)
cd ../frontend
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Development

### Backend

```bash
cd backend

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

### Frontend

```bash
cd frontend

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
array-food-ordering/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── websocket/
│   │   └── server.ts
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user

### Group Endpoints

- `GET /api/groups` - Get all groups (with filters)
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join group
- `DELETE /api/groups/:id` - Delete group (owner only)

### Restaurant & Menu Endpoints

- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id/menu` - Get restaurant menu

### Cart Endpoints

- `GET /api/groups/:groupId/cart` - Get cart items
- `POST /api/groups/:groupId/cart` - Add item to cart
- `DELETE /api/cart-items/:id` - Delete cart item

### Payment Endpoints

- `GET /api/groups/:groupId/payments` - Get payment statuses
- `PUT /api/groups/:groupId/payments/:userId` - Update payment status

### Chat Endpoints

- `GET /api/groups/:groupId/messages` - Get chat messages

## WebSocket Events

### Client → Server

- `join-group` - Join group room
- `leave-group` - Leave group room
- `send-message` - Send chat message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server → Client

- `message-received` - New chat message
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing
- `cart-updated` - Cart state changed
- `group-closed` - Group duration expired
- `payment-updated` - Payment status changed
- `group-deleted` - Group was deleted

## Testing

### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Frontend Tests

```bash
cd frontend
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests with Playwright
```

## Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Manual Deployment

1. Build backend:
```bash
cd backend
npm run build
```

2. Build frontend:
```bash
cd frontend
npm run build
```

3. Set production environment variables
4. Run database migrations
5. Start services

## Environment Variables

### Backend

See `backend/.env.example` for all available variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 4000)
- `EMAIL_*` - Email configuration for password reset

### Frontend

See `frontend/.env.example` for all available variables.

Key variables:
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket server URL

## Security

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting on authentication endpoints
- Input validation and sanitization
- XSS prevention in chat messages
- CSRF protection
- Secure headers with Helmet
- Domain-restricted registration (@array.world)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and formatting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please contact the Array Innovation development team.
