import express from 'express';
import {
  createBooking,
  getUserBookings,
  getMentorBookings,
  cancelBooking,
  completeBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/user/:id', protect, getUserBookings);
router.get('/mentor/:id', protect, getMentorBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/complete', protect, completeBooking);

export default router;

