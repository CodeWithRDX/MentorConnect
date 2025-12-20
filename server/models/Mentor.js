import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    required: [true, 'Please provide a bio'],
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
  },
  skills: [{
    type: String,
    trim: true,
  }],
  categories: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
    min: [0, 'Experience cannot be negative'],
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please provide an hourly rate'],
    min: [0, 'Hourly rate cannot be negative'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  languages: [{
    type: String,
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
  }],
  resources: [{
    title: { type: String, trim: true },
    url: { type: String, trim: true },
    description: { type: String, trim: true },
  }],
}, {
  timestamps: true,
});

// SINGLE-FIELD INDEXES (safe for arrays)
mentorSchema.index({ skills: 1 });
mentorSchema.index({ categories: 1 });
mentorSchema.index({ rating: -1 });

export default mongoose.model('Mentor', mentorSchema);
