import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a goal title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    enum: ['skill', 'career', 'project', 'learning', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
    default: 'not_started',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  targetDate: {
    type: Date,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  milestones: [{
    title: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
}, {
  timestamps: true,
});

// Index for queries
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Goal', goalSchema);

