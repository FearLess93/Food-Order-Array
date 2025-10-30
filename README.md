# Array Eats - Food Ordering System

A complete food ordering system for Array employees with restaurant voting, menu ordering, and Talabat integration.

## Features

- 🔐 Secure authentication (@array.com emails only)
- 🗳️ Daily restaurant voting system
- 🍕 Menu browsing and ordering
- 👥 Group order management
- 📊 Admin dashboard
- 🚚 Talabat API integration
- 🐳 Fully Dockerized

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx

## Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### 1. Clone and Setup

```bash
git clone <repository-url>
cd array-eats
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your email credentials:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
TALABAT_API_KEY=your_key_if_available
```

### 3. Start the Application

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend web app on port 3001

### 4. Access the Application

- **Web App**: http://localhost:3001
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### 5. Create Admin User

First, register a user through the web interface, then promote to admin:

```bash
# Connect to database
docker exec -it array-eats-db psql -U postgres -d array_eats

# Promote user to admin
UPDATE users SET role = 'admin' WHERE email = 'your_email@array.com';
```

## Development

### Run in Development Mode

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## Project Structure

```
array-eats/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Migrations
│   │   └── config/         # Configuration
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React web app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## API Documentation

See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference.

## Talabat Integration

See [backend/TALABAT_INTEGRATION.md](backend/TALABAT_INTEGRATION.md) for Talabat setup guide.

## Daily Workflow

1. **Morning (Admin)**
   - Set available restaurants for the day
   - Open voting period

2. **Voting Period (9 AM - 11 AM)**
   - Employees vote for their preferred restaurant
   - System determines winner

3. **Ordering Period (After 11 AM)**
   - Employees browse menu and place orders
   - View group order summary

4. **Order Placement (Admin)**
   - Export orders or place through Talabat
   - Track delivery

## Troubleshooting

### Cannot connect to database
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Backend not starting
```bash
docker-compose logs backend
# Check if migrations ran successfully
```

### Frontend not loading
```bash
docker-compose logs frontend
# Check nginx configuration
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT secrets
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Review CORS settings

### Environment Variables

Update production values in docker-compose.yml:
- JWT_SECRET
- JWT_REFRESH_SECRET
- Database credentials
- Email configuration
- Talabat API keys

## Support

For issues or questions, contact the development team.

## License

Internal use only - Array Company
