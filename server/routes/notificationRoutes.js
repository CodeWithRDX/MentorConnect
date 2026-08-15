import express from 'express';
import {
  streamNotifications,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// SSE Stream endpoint
router.get('/stream', protect, streamNotifications);

// REST Notification Endpoints
router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllNotificationsAsRead);
router.patch('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
