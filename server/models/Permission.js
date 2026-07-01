import mongoose from 'mongoose';

/**
 * Permission — RBAC document for sub_admin users.
 * One document per sub_admin user. Super admins bypass all checks.
 */
const permissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Configurable permission flags
  canManageUsers:     { type: Boolean, default: false },
  canManageMentors:   { type: Boolean, default: false },
  canViewReports:     { type: Boolean, default: false },
  canModerateContent: { type: Boolean, default: false },
  canViewAnalytics:   { type: Boolean, default: false },

  // Audit fields
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Permission', permissionSchema);
