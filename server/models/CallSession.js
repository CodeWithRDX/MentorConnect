import mongoose from 'mongoose';

/**
 * CallSession — audit trail for WebRTC video calls.
 * Created when a call is initiated, updated when it ends.
 */
const callSessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  callee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'active', 'completed', 'missed', 'rejected'],
    default: 'initiated',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  answeredAt: Date,
  endedAt: Date,
  durationSeconds: {
    type: Number,
    default: 0,
  },
  offer: {
    type: Object,
  },
  answer: {
    type: Object,
  },
}, {
  timestamps: true,
});

callSessionSchema.index({ caller: 1, startedAt: -1 });
callSessionSchema.index({ callee: 1, startedAt: -1 });

export default mongoose.model('CallSession', callSessionSchema);
