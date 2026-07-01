import express from 'express';
import {
  getSubAdmins,
  promoteToSubAdmin,
  updatePermissions,
  revokeSubAdmin,
} from '../controllers/permissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All permission management is admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/sub-admins',         getSubAdmins);
router.post('/promote/:userId',   promoteToSubAdmin);
router.put('/:userId',            updatePermissions);
router.delete('/:userId',         revokeSubAdmin);

export default router;
