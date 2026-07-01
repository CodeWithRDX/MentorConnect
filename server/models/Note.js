import mongoose from 'mongoose';

/**
 * Note — shared session notes between mentor and mentee.
 * One document per booking session, updated in real-time.
 */
const noteSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Note content cannot exceed 50,000 characters'],
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Note', noteSchema);
