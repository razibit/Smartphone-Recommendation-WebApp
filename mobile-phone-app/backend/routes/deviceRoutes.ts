import express from 'express';
import { DeviceController } from '../controllers/deviceController';
import { ValidationError } from '../middleware/errorHandler';

const router = express.Router();
const deviceController = new DeviceController();

// Validation middleware for search requests
const validateSearchRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { filters, sortBy, sortOrder, page, limit } = req.body;
  
  // Validate pagination parameters
  if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
    throw new ValidationError('Page must be a positive integer');
  }
  
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
    throw new ValidationError('Limit must be a positive integer between 1 and 100');
  }
  
  // Validate sort parameters
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    throw new ValidationError('Sort order must be either "asc" or "desc"');
  }
  
  next();
};

// Validation middleware for device ID parameter
const validateDeviceId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { id } = req.params;
  
  if (!id || id.trim() === '') {
    throw new ValidationError('Device ID is required');
  }
  
  // Check if ID is a valid integer
  const deviceId = parseInt(id);
  if (isNaN(deviceId) || deviceId < 1) {
    throw new ValidationError('Device ID must be a positive integer');
  }
  
  next();
};

// GET /api/devices/filters - Get filter options (must be before /:id)
router.get('/filters', deviceController.getFilterOptions);

// POST /api/devices/search - Search phones with filters
router.post('/search', validateSearchRequest, deviceController.searchPhones);

// GET /api/devices - Get all devices with pagination
router.get('/', deviceController.getAllDevices);

// GET /api/devices/:id - Get phone details (must be last)
router.get('/:id', validateDeviceId, deviceController.getPhoneDetails);

export default router;