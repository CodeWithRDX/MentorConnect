import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUser,
} from '../controllers/authController.js';
import { googleOAuth } from '../controllers/oauthController.js';
import { protect } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateBody(schemas.register), register);
router.post('/login', validateBody(schemas.login), login);
router.post('/refresh', refresh);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth
router.post('/oauth/google', googleOAuth);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile/update', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/change-password', protect, changePassword);

// Must be last — generic param route
router.get('/:id', protect, getUser);

export default router;
