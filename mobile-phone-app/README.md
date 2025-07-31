# 📱 PhoneDB - Mobile Phone Database & Recommendation System

> A comprehensive full-stack web application demonstrating advanced database normalization principles (3NF/BCNF) with modern web technologies. Built as a DBMS course project showcasing proper database design, dynamic query generation, and responsive UI development.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)](https://www.mysql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 🎯 Project Overview

PhoneDB transforms a flat CSV dataset containing 67+ phone specifications into a fully normalized relational database with **15 interconnected tables**, eliminating redundancy while maintaining data integrity. The system provides an intuitive interface for filtering, comparing, and exploring mobile phone specifications.

### 🏆 Key Achievements

- ✅ **Database Normalization**: Perfect 3NF/BCNF compliance with zero redundancy
- ✅ **Dynamic SQL Generation**: Intelligent query builder with advanced filtering
- ✅ **Performance Optimization**: Database indexing, API caching, and bundle optimization
- ✅ **Responsive Design**: Mobile-first UI with modern design principles
- ✅ **Real-time Monitoring**: Performance metrics and cache management
- ✅ **Type Safety**: Full TypeScript implementation with strict typing

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4+
- **Components**: Custom React components with dynamic imports
- **State Management**: React Hooks with URL-based state
- **Image Optimization**: Next.js Image with WebP/AVIF support

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19+
- **Database**: MySQL 8.0+ with connection pooling
- **ORM**: Raw SQL with custom query builder
- **Caching**: In-memory TTL-based API response caching
- **Monitoring**: Performance tracking and query optimization

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript support
- **Build Tool**: SWC compiler with optimization
- **Development**: Hot reload with Turbopack
- **Bundle Analysis**: Webpack Bundle Analyzer

## 📁 Project Architecture

```
mobile-phone-app/
├── 📂 src/                           # Next.js Frontend Source
│   ├── 📂 app/                      # App Router Pages
│   │   ├── 📄 page.tsx             # Homepage with feature showcase
│   │   ├── 📄 layout.tsx           # Root layout with metadata
│   │   ├── 📂 phones/              # Phone browsing and filtering
│   │   └── 📂 compare/             # Phone comparison interface
│   ├── 📂 components/              # Reusable React Components
│   │   ├── 📂 FilterBar/           # Advanced filtering interface
│   │   ├── 📂 PhoneList/           # Phone cards and listings
│   │   ├── 📂 PhoneDetails/        # Detailed phone modal
│   │   ├── 📂 PhoneComparison/     # Side-by-side comparison
│   │   ├── 📂 SQLQueryBox/         # Dynamic SQL display
│   │   ├── 📂 Layout/              # App layout components
│   │   ├── 📂 UI/                  # Reusable UI elements
│   │   └── 📂 PerformanceMonitor/  # Real-time metrics
│   └── 📂 lib/                     # Utilities and API client
├── 📂 backend/                      # Express.js Backend
│   ├── 📄 server.ts                # Main server configuration
│   ├── 📂 routes/                  # API route definitions
│   ├── 📂 controllers/             # Business logic handlers
│   ├── 📂 database/                # Database layer
│   │   ├── 📄 connection.ts        # MySQL connection pool
│   │   ├── 📄 queryBuilder.ts      # Dynamic SQL generator
│   │   ├── 📄 migrate.ts           # Migration system
│   │   ├── 📄 seed.ts              # Data seeding utilities
│   │   ├── 📄 performanceMonitor.ts # Query performance tracking
│   │   ├── 📂 migrations/          # Database schema versions
│   │   └── 📂 seeders/             # Data import utilities
│   └── 📂 middleware/              # Express middleware
│       ├── 📄 errorHandler.ts      # Centralized error handling
│       ├── 📄 validation.ts        # Input validation & sanitization
│       ├── 📄 logging.ts           # Request/response logging
│       └── 📄 caching.ts           # API response caching
├── 📂 scripts/                     # Automation and testing
├── 📂 docs/                        # Comprehensive documentation
├── 📄 next.config.ts               # Next.js configuration with optimizations
├── 📄 tailwind.config.js           # Tailwind CSS configuration
└── 📄 package.json                 # Dependencies and npm scripts
```

## 🛠️ Quick Start Guide

### Prerequisites

- **Node.js** 18.0 or higher
- **MySQL** 8.0 or higher
- **npm** 9.0 or higher

### 1. 📥 Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd mobile-phone-app

# Install all dependencies
npm install
```

### 2. 🔧 Environment Configuration

Create environment configuration:

```bash
# Create environment file
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mobile_specs

# Node Environment
NODE_ENV=development

# API Configuration
API_BASE_URL=http://localhost:3001/api
```

### 3. 🗄️ Database Setup

```bash
# Ensure MySQL is running and create database
mysql -u root -p -e "CREATE DATABASE mobile_specs;"

# Run database migrations
npm run migrate

# Seed with sample data (optional)
npm run seed
```

### 4. 🚀 Start Development Servers

**Option A: Manual Start (Recommended for development)**
```bash
# Terminal 1: Start backend server
npm run backend:dev

# Terminal 2: Start frontend server
npm run dev
```

**Option B: Background Start (Windows PowerShell)**
```powershell
# Start both services in background windows
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run backend:dev"
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev"
```

### 5. 🌐 Access Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)
- **API Documentation**: [http://localhost:3001/api](http://localhost:3001/api)

## 📋 Available Scripts

### Development Scripts
```bash
npm run dev              # Start Next.js development server (Turbopack)
npm run backend:dev      # Start Express backend with auto-reload
npm run lint             # Run ESLint for code quality
```

### Production Scripts
```bash
npm run build            # Build Next.js for production
npm run build:optimized  # Production build with optimizations
npm run start            # Start Next.js production server
npm run backend          # Start Express backend (production mode)
```

### Database Scripts
```bash
npm run migrate          # Run database migrations
npm run migrate:rollback # Rollback last migration
npm run seed             # Seed database with sample data
```

### Performance & Testing Scripts
```bash
npm run analyze          # Analyze bundle size with webpack-bundle-analyzer
npm run optimize         # Run all performance optimizations
npm run test:scalability # Load test backend API performance
```

## 🏗️ Database Design & Normalization

### Database Schema Overview

The system transforms a flat CSV with 67+ columns into **15 normalized tables**, demonstrating perfect adherence to 3NF and BCNF principles:

#### Core Entity Tables
1. **`phones`** - Main device information
2. **`brands`** - Device manufacturers (eliminates brand redundancy)
3. **`chipsets`** - Processor information (eliminates chipset redundancy)
4. **`operating_systems`** - OS and version details
5. **`displays`** - Screen specifications and display types
6. **`cameras`** - Camera system details (front/rear)
7. **`storage_info`** - Internal storage and memory details
8. **`connectivity`** - Network and wireless capabilities
9. **`physical_specs`** - Dimensions, weight, and materials
10. **`pricing`** - Price information by region/time

#### Lookup Tables (Reference Data)
11. **`display_types`** - Screen technology types
12. **`storage_types`** - Memory technology types  
13. **`ram_types`** - RAM technology types
14. **`network_types`** - Cellular network standards
15. **`body_materials`** - Device construction materials

### Normalization Compliance

#### 🎯 Third Normal Form (3NF)
- ✅ **1NF**: All attributes contain atomic values
- ✅ **2NF**: No partial dependencies on composite keys
- ✅ **3NF**: No transitive dependencies between non-key attributes

#### 🎯 Boyce-Codd Normal Form (BCNF)
- ✅ Every functional dependency has a superkey as its determinant
- ✅ Each table has exactly one candidate key
- ✅ No anomalies in insert, update, or delete operations

### Key Relationships

```sql
phones ──┐
         ├─→ brands (brand_id)
         ├─→ chipsets (chipset_id)  
         ├─→ operating_systems (os_id)
         ├─→ displays (display_id)
         ├─→ cameras (camera_id)
         ├─→ storage_info (storage_id)
         ├─→ connectivity (connectivity_id)
         ├─→ physical_specs (physical_id)
         └─→ pricing (pricing_id)

displays ──→ display_types (display_type_id)
storage_info ──┐
               ├─→ storage_types (internal_storage_type_id)
               └─→ ram_types (ram_type_id)
connectivity ──→ network_types (primary_network_id)
physical_specs ──→ body_materials (body_material_id)
```

## 🎨 Features & Functionality

### 🔍 Advanced Filtering System
- **Multi-criteria filtering**: Brand, chipset, storage, price range, display type
- **Dynamic SQL generation**: Real-time query building with parameter binding
- **Live filter options**: Dropdown values populated from current database state
- **Query visibility**: Display actual SQL queries for educational purposes

### 📱 Phone Comparison
- **Multi-select capability**: Choose multiple phones for side-by-side comparison
- **Tabular comparison**: Organized specification comparison with difference highlighting
- **Responsive design**: Optimized for both mobile and desktop viewing
- **Smart navigation**: URL-based state management for shareable comparisons

### 🚀 Performance Optimizations
- **Database indexing**: 35+ optimized indexes including composite and covering indexes
- **API caching**: In-memory TTL-based response caching with statistics
- **Bundle optimization**: Code splitting, tree shaking, and dynamic imports
- **Image optimization**: WebP/AVIF support with responsive sizing
- **Query monitoring**: Real-time database performance tracking

### 📊 Real-time Monitoring
- **Performance metrics**: Page load times, memory usage, paint metrics
- **Cache statistics**: Hit/miss ratios, TTL management, cache size monitoring
- **Database insights**: Query execution times, connection pool status
- **Development tools**: Visible only in development mode

## 🎓 Educational Value

### Database Concepts Demonstrated
- **Normalization Theory**: Practical application of 3NF/BCNF
- **Query Optimization**: Index design and query planning
- **Connection Pooling**: Efficient database resource management
- **Transaction Management**: ACID compliance and data integrity

### Software Engineering Practices
- **Clean Architecture**: Separation of concerns and layered design
- **Type Safety**: Full TypeScript implementation with strict typing
- **Error Handling**: Comprehensive error boundaries and graceful degradation
- **Performance Monitoring**: Real-time metrics and optimization techniques
- **Responsive Design**: Mobile-first development with accessibility

### Modern Web Development
- **Server-Side Rendering**: Next.js App Router with hybrid rendering
- **API Design**: RESTful endpoints with proper HTTP semantics
- **Caching Strategies**: Multi-level caching for optimal performance
- **Build Optimization**: Advanced bundling and code splitting techniques

## 🔧 Configuration Details

### Next.js Configuration
```typescript
// Key optimizations in next.config.ts
export default {
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  webpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          ui: { test: /[\\/]components[\\/]UI[\\/]/ },
          phoneComponents: { test: /[\\/]components[\\/]Phone/ },
        }
      }
    }
  }
}
```

### Database Connection Pool
```typescript
// Optimized connection pool settings
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Core Endpoints

#### Get Filter Options
```http
GET /api/devices/filters
```
Returns all available filter options for brands, chipsets, storage, etc.

#### Search Phones
```http
POST /api/devices/search
Content-Type: application/json

{
  "brand": "Samsung",
  "chipset": "Snapdragon",
  "minPrice": 300,
  "maxPrice": 1000,
  "page": 1,
  "limit": 20
}
```

#### Get Phone Details
```http
GET /api/devices/:id
```
Returns comprehensive phone specifications by ID.

#### Health Check
```http
GET /health
```
Returns server and database health status with performance metrics.

## 🚀 Deployment

### Production Build
```bash
# Build optimized production version
npm run build:optimized

# Start production server
npm run start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_secure_password
DB_NAME=mobile_specs
PORT=3001
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run tests: `npm run test:scalability`
4. Commit changes: `git commit -m 'Add feature'`
5. Push to branch: `git push origin feature/your-feature`
6. Submit a Pull Request

### Code Standards
- **TypeScript**: Strict typing required
- **ESLint**: Follow configured linting rules
- **Formatting**: Consistent code formatting
- **Testing**: Include performance tests for new features

## 📄 License

This project is created for educational purposes as a DBMS course project. Feel free to use it for learning and academic purposes.

## 🙏 Acknowledgments

- **Course**: Database Management Systems (DBMS)
- **Target Audience**: 3rd-year Computer Science students
- **Purpose**: Demonstrate advanced database normalization and modern web development practices
- **Data Source**: Mobile phone specifications dataset normalized into relational schema

---

**Built with ❤️ for educational excellence in database design and modern web development**