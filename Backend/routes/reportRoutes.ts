
import express from 'express';
import * as reportController from '../controllers/reportController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Publicly visible reports? Or should they be protected?
// Usually, everyone can see them, but only logged in can create/update.
router.get('/', reportController.getAllReports);

// Create report: Any logged in user
router.post('/', protect, reportController.createReport);

// Update status: Only Admins or Authorities
router.patch('/:id', protect, authorize('admin', 'authority'), reportController.updateReportStatus);

// Delete report: Only Admins
router.delete('/:id', protect, authorize('admin'), reportController.deleteReport);

export default router;
