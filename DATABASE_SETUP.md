# Quick Database Setup - Cloud PostgreSQL

Since Docker PostgreSQL isn't starting, let's use a **free cloud database** instead. This takes 2 minutes:

## Option 1: Supabase (Recommended - Easiest)

1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up with GitHub (free)
4. Create a new project:
   - Name: `array-eats`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Wait 2 minutes for database to provision
6. Go to Project Settings → Database
7. Copy the "Connection string" (URI format)
8. Paste it in `backend/.env` as `DATABASE_URL`

## Option 2: ElephantSQL (Also Free)

1. Go to https://www.elephantsql.com/
2. Sign up (free)
3. Create New Instance
   - Name: `array-eats`
   - Plan: Tiny Turtle (Free)
   - Region: Choose closest
4. Copy the URL
5. Paste it in `backend/.env` as `DATABASE_URL`

## Option 3: Neon (Modern, Fast)

1. Go to https://neon.tech/
2. Sign up with GitHub
3. Create project: `array-eats`
4. Copy connection string
5. Paste in `backend/.env`

## After Getting Database URL:

```bash
cd backend

# Update .env with your database URL
# DATABASE_URL="postgresql://user:password@host:5432/database"

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed

# Start backend
npm run dev
```

The backend will be at http://localhost:4000

Then I'll build the frontend so you can open the website!
