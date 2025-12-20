import express from 'express';
import {
  createGoal,
  getUserGoals,
  getGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/').post(createGoal).get(getUserGoals);
router.route('/:id').get(getGoal).put(updateGoal).delete(deleteGoal);

export default router;

