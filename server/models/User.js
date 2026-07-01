import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
    // Not required — OAuth-only users have no password
  },
  role: {
    type: String,
    enum: ['mentee', 'mentor', 'admin', 'sub_admin'],
    default: 'mentee',
  },
  avatar: {
    type: String,
    default: '',
  },

  // ── Profile Extended Fields ─────────────────────────────────────────────────
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter:  { type: String, default: '' },
    website:  { type: String, default: '' },
  },

  // ── Notification & App Preferences ─────────────────────────────────────────
  preferences: {
    emailNotifications: { type: Boolean, default: true  },
    sessionReminders:   { type: Boolean, default: true  },
    marketingEmails:    { type: Boolean, default: false },
    theme:    { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    timezone: { type: String, default: 'UTC' },
  },

  // ── OAuth Providers ─────────────────────────────────────────────────────────
  oauthProviders: [{
    provider:   { type: String, enum: ['google'] },
    providerId: String,   // Google's "sub" (unique stable user ID)
    email:      String,   // email returned by provider
  }],

  // ── Email Verification ──────────────────────────────────────────────────────
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,

  // ── Password Reset ──────────────────────────────────────────────────────────
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // ── Account Status (for Admin management) ──────────────────────────────────
  isActive: {
    type: Boolean,
    default: true,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  suspendedUntil: Date,
  suspendedReason: {
    type: String,
    default: '',
  },

  // ── Activity Tracking ───────────────────────────────────────────────────────
  lastLoginAt: Date,
  loginCount: {
    type: Number,
    default: 0,
  },

  // ── Relations ───────────────────────────────────────────────────────────────
  mentorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
  }],
}, {
  timestamps: true,
});

// ── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Generate JWT token ───────────────────────────────────────────────────────
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ── Compare password (handles OAuth-only accounts gracefully) ────────────────
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    // OAuth-only account — cannot log in with password
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Generate email verification token ───────────────────────────────────────
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// ── Generate password reset token ────────────────────────────────────────────
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

export default mongoose.model('User', userSchema);
