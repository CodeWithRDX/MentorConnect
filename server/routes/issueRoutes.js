import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  createIssue, 
  listIssues, 
  updateIssue, 
  addRemarks, 
  markInProgress, 
  closeIssue 
} from '../controllers/issueController.js';

const router = express.Router();

// All issue routes require auth
router.use(protect);

router.post('/', createIssue);
router.get('/', listIssues);
router.put('/:id', authorize('admin'), updateIssue);
router.put('/:id/remarks', authorize('admin'), addRemarks);
router.put('/:id/progress', authorize('admin'), markInProgress);
router.put('/:id/close', authorize('admin'), closeIssue);

export default router;


