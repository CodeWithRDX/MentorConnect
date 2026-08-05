import express from 'express';
import {
  createBooking,
  getUserBookings,
  getMentorBookings,
  cancelBooking,
  completeBooking,
  approveBooking,
  rejectBooking,
  getActiveCallSession,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/', protect, validateBody(schemas.booking), createBooking);
router.get('/user/:id', protect, getUserBookings);
router.get('/mentor/:id', protect, getMentorBookings);
router.get('/:id/active-call', protect, getActiveCallSession);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/complete', protect, completeBooking);
router.put('/:id/approve', protect, approveBooking);
router.put('/:id/reject', protect, rejectBooking);

export default router;

