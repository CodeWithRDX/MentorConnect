import express from 'express';
import {
  getMentors,
  getMentor,
  applyMentor,
  updateMentor,
  getMentorsByCategory,
  getTopMentors,
} from '../controllers/mentorController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getMentors);
router.get('/top', getTopMentors);
router.get('/category/:category', getMentorsByCategory);
router.get('/:id', getMentor);
router.post('/apply', protect, applyMentor);
router.put('/:id', protect, updateMentor);

export default router;

