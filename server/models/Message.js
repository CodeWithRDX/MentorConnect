import mongoose from 'mongoose';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const MessageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Message body cannot exceed 2000 characters'],
    },
    // TTL field — MongoDB auto-deletes the document once this date is reached
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + THIRTY_DAYS_MS),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', MessageSchema);

export default Message;
