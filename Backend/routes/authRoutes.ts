
import express from 'express';
import * as authController from '../controllers/authController.ts';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/send-otp', authController.sendLoginOTP);

export default router;
