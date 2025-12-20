import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['mentee', 'mentor', 'admin'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['payment', 'technical', 'account', 'other'], default: 'other' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  remark: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model('Issue', issueSchema);


