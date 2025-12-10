import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createIssue, listIssues, updateIssue } from '../controllers/issueController.js';

const router = express.Router();

// All issue routes require auth
router.use(protect);

router.post('/', createIssue);
router.get('/', listIssues);
router.put('/:id', authorize('admin'), updateIssue);

export default router;


