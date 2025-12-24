import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/:id', protect, getUser); // Add this general getter
router.put('/profile/update', protect, updateProfile);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

