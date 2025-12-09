import express from 'express';
import {
  getUsers,
  approveMentor,
  deleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStats,
  getAllMentors,
  getAllBookings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/all-users', getUsers);
router.get('/all-mentors', getAllMentors);
router.get('/all-bookings', getAllBookings);
router.put('/mentor/approve/:id', approveMentor);
router.delete('/user/:id', deleteUser);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/stats', getStats);

export default router;

