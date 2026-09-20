import express from 'express';
import { DeviceController } from '../controllers/deviceController';
import { AppConfig } from '../config';
import { DatabaseConnection } from '../database/connection';
import { validateJsonContent } from '../middleware/validation';

export function createDeviceRoutes(db: DatabaseConnection, config: AppConfig): express.Router {
  const router = express.Router();
  const controller = new DeviceController(db, config);

  router.get('/filters', controller.getFilterOptions);
  router.post('/search', validateJsonContent, controller.searchPhones);
  router.get('/', controller.getAllDevices);
  router.get('/:id', controller.getPhoneDetails);

  return router;
}

export default createDeviceRoutes;
