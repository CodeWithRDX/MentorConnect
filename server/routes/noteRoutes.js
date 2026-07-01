import express from 'express';
import { getNote, saveNote } from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/:bookingId',  getNote);
router.put('/:bookingId',  saveNote);

export default router;
