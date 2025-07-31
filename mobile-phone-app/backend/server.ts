import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import deviceRoutes from './routes/deviceRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLogger } from './middleware/logging';
import { sanitizeInput } from './middleware/validation';
import { DatabaseConnection } from './database/connection';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database connection
const db = new DatabaseConnection();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security and CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Security middleware
app.use(sanitizeInput);

// Logging middleware
app.use(apiLogger);

// Routes
app.use('/api/devices', deviceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile Phone Recommendation API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      devices: '/api/devices',
      filters: '/api/devices/filters',
      search: '/api/devices/search'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with detailed status
app.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await db.query('SELECT 1');
    const dbResponseTime = Date.now() - startTime;
    
    // Get database pool stats
    const poolStats = db.getPoolStats();
    
    res.json({ 
      success: true,
      status: 'OK', 
      message: 'Server is running',
      services: {
        database: {
          status: 'Connected',
          responseTime: `${dbResponseTime}ms`,
          pool: poolStats
        },
        server: {
          status: 'Running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      success: false,
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile Phone Recommendation API',
    version: '1.0.0',
    endpoints: {
      'GET /api/devices': 'Get all devices with pagination',
      'GET /api/devices/filters': 'Get filter options',
      'POST /api/devices/search': 'Search devices with filters',
      'GET /api/devices/:id': 'Get device details by ID'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      status: 404,
      availableEndpoints: [
        'GET /',
        'GET /health',
        'GET /api',
        'GET /api/devices',
        'GET /api/devices/filters',
        'POST /api/devices/search',
        'GET /api/devices/:id'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  try {
    await db.close();
    console.log('✅ Database connections closed');
    console.log('👋 Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

app.listen(PORT, () => {
  console.log('🚀 Mobile Phone Recommendation API Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🏠 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('✅ Server initialization complete\n');
});

export default app;