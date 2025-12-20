import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendMessage, getConversation, getContacts } from '../controllers/messageController.js';

const router = express.Router();

// Send a new message
router.post('/', protect, sendMessage);

// Get conversation between logged-in user and another user
router.get('/conversation/:userId', protect, getConversation);

// Get list of contacts (users you've chatted with) with last message
router.get('/contacts', protect, getContacts);

export default router;





