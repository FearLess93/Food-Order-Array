# Array Eats - Complete Setup Guide

## Quick Start (Docker - Recommended)

### Prerequisites
- Docker Desktop installed and running
- Git (optional)

### Steps

1. **Clone or download the project**
```bash
cd array-eats
```

2. **Create environment file**
```bash
cp .env.example .env
```

Edit `.env` and add your email credentials:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

3. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 3000)
- Frontend web app (port 3001)

4. **Access the application**
- Open browser: http://localhost:3001
- API: http://localhost:3000/api

5. **Create first admin user**
- Register through the web interface
- Connect to database and promote user:
```bash
docker exec -it array-eats-db psql -U postgres -d array_eats
UPDATE users SET role = 'admin' WHERE email = 'your_email@array.com';
\q
```

## Manual Setup (Without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=array_eats
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

3. **Create database**
```bash
createdb array_eats
```

4. **Run migrations**
```bash
npm run build
npm run migrate
```

5. **Start backend**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start frontend**
```bash
npm run dev
```

3. **Access application**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

## Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use generated password in `.env`

## Talabat Integration (Optional)

1. Get API credentials from Talabat
2. Add to `.env`:
```env
TALABAT_API_KEY=your_key
TALABAT_ENABLED=true
```

3. Restart services:
```bash
docker-compose restart
```

## Daily Workflow

### For Employees
1. **Morning (9-11 AM)**: Vote for restaurant
2. **After 11 AM**: View winner and place order
3. **Anytime**: Check group order status

### For Admins
1. **Morning**: Set available restaurants (optional)
2. **11 AM**: Close voting (automatic)
3. **After orders**: Export orders or place through Talabat
4. **View**: Dashboard statistics

## Troubleshooting

### Cannot access application
```bash
# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### Database connection error
```bash
# Check database is running
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Email not sending
- Verify email credentials in `.env`
- Check Gmail app password is correct
- Ensure 2FA is enabled on Gmail

### Port already in use
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "3002:3001"  # Change 3001 to 3002
```

## Production Deployment

### Security Checklist
- [ ] Change all default passwords
- [ ] Set strong JWT secrets
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall
- [ ] Enable database backups
- [ ] Configure production email service
- [ ] Set up monitoring
- [ ] Review CORS settings
- [ ] Use environment-specific configs

### Deployment Steps
1. Update `docker-compose.yml` with production values
2. Set `NODE_ENV=production`
3. Configure reverse proxy (Nginx/Traefik)
4. Set up SSL certificates
5. Configure domain DNS
6. Set up automated backups
7. Configure monitoring/logging

## Useful Commands

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Rebuild after code changes
docker-compose up -d --build

# Remove everything (including data)
docker-compose down -v
```

### Database
```bash
# Connect to database
docker exec -it array-eats-db psql -U postgres -d array_eats

# Backup database
docker exec array-eats-db pg_dump -U postgres array_eats > backup.sql

# Restore database
docker exec -i array-eats-db psql -U postgres array_eats < backup.sql

# View tables
docker exec -it array-eats-db psql -U postgres -d array_eats -c "\dt"
```

### Application
```bash
# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend

# Restart backend
docker-compose restart backend

# Run migrations
docker-compose exec backend npm run migrate
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review documentation
3. Contact development team

## License
Internal use only - Array Company
