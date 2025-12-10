import express from 'express';
import {
  getUsers,
  approveMentor,
  rejectMentor,
  deleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStats,
  getAllMentors,
  getAllBookings,
  adminLogin
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin' });
});

// All admin routes require authentication and admin role

// PUBLIC ROUTE — no protect, no authorize
router.post('/login', adminLogin);

// All following routes require admin auth
router.use(protect);
router.use(authorize('admin'));


router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/all-users', getUsers);
router.get('/all-mentors', getAllMentors);
router.get('/all-bookings', getAllBookings);
router.put('/mentor/approve/:id', approveMentor);
router.put('/mentor/reject/:id', rejectMentor);
router.delete('/user/:id', deleteUser);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/stats', protect, authorize('admin'), getStats);

export default router;

