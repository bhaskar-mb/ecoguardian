
import express from 'express';
import * as userController from '../controllers/userController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Publicly available leaderboard for authenticated users
router.get('/leaderboard', protect, userController.getLeaderboard);

// Only Admins can see or manage the user list
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.post('/', protect, authorize('admin', 'user', 'authority'), userController.createUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

export default router;
