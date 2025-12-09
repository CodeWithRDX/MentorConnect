import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true,
  },
  sessionDate: {
    type: Date,
    required: [true, 'Please provide a session date'],
  },
  sessionTime: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  duration: {
    type: Number,
    required: true,
    default: 60, // minutes
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  meetingLink: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    createdAt: Date,
  },
}, {
  timestamps: true,
});

// Index for queries
bookingSchema.index({ mentee: 1, sessionDate: -1 });
bookingSchema.index({ mentor: 1, sessionDate: -1 });

export default mongoose.model('Booking', bookingSchema);

