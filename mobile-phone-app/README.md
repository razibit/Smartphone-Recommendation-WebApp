# Mobile Phone Recommendation System

A full-stack web application demonstrating database normalization principles while providing an intuitive interface for filtering and comparing mobile phones. Built as a DBMS course project for 3rd-year Computer Science students.

## Technology Stack

- **Frontend**: Next.js 14+ with React, TypeScript, and Tailwind CSS
- **Backend**: Node.js with Express.js framework
- **Database**: MySQL 8.0+ with mysql2 driver and connection pooling
- **Development**: Local development environment with GitHub deployment

## Project Structure

```
mobile-phone-app/
├── src/                    # Next.js frontend source
│   └── app/               # App router pages
├── backend/               # Express.js backend
│   ├── server.ts         # Main server file
│   ├── routes/           # API route handlers
│   ├── controllers/      # Business logic controllers
│   ├── database/         # Database connection and utilities
│   └── middleware/       # Express middleware
├── .env.local           # Environment variables (local)
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## Setup Instructions

### 1. Environment Configuration

Copy the environment template and configure your database credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database settings:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mobile_specs
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Ensure MySQL is running and create the database:

```sql
CREATE DATABASE mobile_specs;
```

### 4. Run the Application

Start the backend server:

```bash
npm run backend:dev
```

In a separate terminal, start the frontend:

```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)
- Health Check: [http://localhost:3001/health](http://localhost:3001/health)

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run backend` - Start Express backend server
- `npm run backend:dev` - Start Express backend with auto-reload
- `npm run build` - Build Next.js for production
- `npm run start` - Start Next.js production server
- `npm run lint` - Run ESLint

## Features (To Be Implemented)

- ✅ Project structure and database connection
- ⏳ Database schema and seed data
- ⏳ Backend API endpoints
- ⏳ Dynamic SQL query builder
- ⏳ Frontend components (FilterBar, PhoneList, SQLQueryBox)
- ⏳ Phone filtering and comparison functionality
- ⏳ Responsive design and UI polish

## Database Design

The application demonstrates proper database normalization (3NF and BCNF) by transforming a flat CSV dataset with 67+ columns into a normalized relational database with 15 interconnected tables, eliminating redundancy while maintaining data integrity.

## Educational Purpose

This project serves as an educational tool for database concepts, showing:
- Proper database normalization techniques
- Dynamic SQL query generation
- Modern full-stack development practices
- Clean code architecture and best practices
