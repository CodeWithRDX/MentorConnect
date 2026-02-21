import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    submitContact,
    listContactMessages,
    updateContactStatus,
    deleteContactMessage,
} from '../controllers/contactController.js';

const router = express.Router();

// Public — anyone can submit a contact message (no auth needed)
router.post('/', submitContact);

// Admin only — read, update, delete contact messages
router.get('/', protect, authorize('admin'), listContactMessages);
router.patch('/:id/status', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

export default router;
