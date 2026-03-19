
import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.get('/', reportController.getAllReports);
router.post('/', reportController.createReport);
router.patch('/:id', reportController.updateReportStatus);

export default router;
