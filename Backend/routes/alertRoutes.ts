
import express from 'express';
import * as alertController from '../controllers/alertController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.get('/', alertController.getAllAlerts);

// Only Admins can issue or clear broadcast alerts
router.post('/', protect, authorize('admin', 'authority'), alertController.createAlert);
router.delete('/:id', protect, authorize('admin'), alertController.deleteAlert);

export default router;
