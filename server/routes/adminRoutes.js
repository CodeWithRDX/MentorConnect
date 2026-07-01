import express from 'express';
import {
  adminLogin,
  getUsers,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  getUserActivity,
  approveMentor,
  rejectMentor,
  updateMentorDetails,
  toggleMentorStatus,
  getMentorStats,
  deleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStats,
  getAllMentors,
  getAllBookings,
} from '../controllers/adminController.js';
import { protect, authorize, authorizeWithPermission } from '../middleware/auth.js';

const router = express.Router();

// ── Public: Admin login (handles both admin and sub_admin) ───────────────────
router.post('/login', adminLogin);

// ── All routes below require authentication ──────────────────────────────────
router.use(protect);

// ── Super Admin + Sub Admin (with permission) — User Management ──────────────
router.get('/users',                 authorize('admin', 'sub_admin'), authorizeWithPermission('canManageUsers'), getUsers);
router.put('/user/:id/status',       authorize('admin', 'sub_admin'), authorizeWithPermission('canManageUsers'), updateUserStatus);
router.put('/user/:id/role',         authorize('admin'),              updateUserRole);
router.post('/user/:id/reset-password', authorize('admin', 'sub_admin'), authorizeWithPermission('canManageUsers'), resetUserPassword);
router.get('/user/:id/activity',     authorize('admin', 'sub_admin'), authorizeWithPermission('canManageUsers'), getUserActivity);
router.delete('/user/:id',           authorize('admin'),              deleteUser);

// ── Backward-compatible alias ─────────────────────────────────────────────────
router.get('/all-users', authorize('admin', 'sub_admin'), authorizeWithPermission('canManageUsers'), getUsers);

// ── Mentor Management ────────────────────────────────────────────────────────
router.get('/all-mentors',           authorize('admin', 'sub_admin'), authorizeWithPermission('canManageMentors'), getAllMentors);
router.put('/mentor/approve/:id',    authorize('admin', 'sub_admin'), authorizeWithPermission('canManageMentors'), approveMentor);
router.put('/mentor/reject/:id',     authorize('admin', 'sub_admin'), authorizeWithPermission('canManageMentors'), rejectMentor);
router.put('/mentor/:id',            authorize('admin', 'sub_admin'), authorizeWithPermission('canManageMentors'), updateMentorDetails);
router.put('/mentor/:id/toggle',     authorize('admin', 'sub_admin'), authorizeWithPermission('canManageMentors'), toggleMentorStatus);
router.get('/mentor/:id/stats',      authorize('admin', 'sub_admin'), authorizeWithPermission('canManageMentors'), getMentorStats);

// ── Bookings & Stats (admin only) ────────────────────────────────────────────
router.get('/all-bookings',          authorize('admin'),              getAllBookings);
router.get('/stats',                 authorize('admin', 'sub_admin'), authorizeWithPermission('canViewReports'),   getStats);

// ── Categories (admin only) ──────────────────────────────────────────────────
router.get('/categories',            authorize('admin'),              getCategories);
router.post('/categories',           authorize('admin'),              createCategory);
router.put('/categories/:id',        authorize('admin'),              updateCategory);
router.delete('/categories/:id',     authorize('admin'),              deleteCategory);

export default router;
