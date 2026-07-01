import User from '../models/User.js';
import Permission from '../models/Permission.js';

// @desc    Get all sub admins with their permissions
// @route   GET /api/permissions/sub-admins
// @access  Private (admin only)
export const getSubAdmins = async (req, res, next) => {
  try {
    const subAdmins = await User.find({ role: 'sub_admin' })
      .select('name email avatar createdAt lastLoginAt loginCount isActive');

    const withPermissions = await Promise.all(
      subAdmins.map(async (u) => {
        const perms = await Permission.findOne({ user: u._id })
          .populate('grantedBy', 'name email');
        return { ...u.toObject(), permissions: perms };
      })
    );

    res.status(200).json({ success: true, count: withPermissions.length, data: withPermissions });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote a user to sub_admin and set permissions
// @route   POST /api/permissions/promote/:userId
// @access  Private (admin only)
export const promoteToSubAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { canManageUsers, canManageMentors, canViewReports, canModerateContent, canViewAnalytics } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin accounts' });
    }

    // Promote to sub_admin
    user.role = 'sub_admin';
    await user.save();

    // Create or update permissions
    const permissions = await Permission.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        canManageUsers:     Boolean(canManageUsers),
        canManageMentors:   Boolean(canManageMentors),
        canViewReports:     Boolean(canViewReports),
        canModerateContent: Boolean(canModerateContent),
        canViewAnalytics:   Boolean(canViewAnalytics),
        grantedBy:          req.user.id,
        grantedAt:          new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${user.name} promoted to Sub Admin`,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, permissions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sub_admin permissions
// @route   PUT /api/permissions/:userId
// @access  Private (admin only)
export const updatePermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { canManageUsers, canManageMentors, canViewReports, canModerateContent, canViewAnalytics } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== 'sub_admin') {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }

    const permissions = await Permission.findOneAndUpdate(
      { user: userId },
      {
        canManageUsers:     Boolean(canManageUsers),
        canManageMentors:   Boolean(canManageMentors),
        canViewReports:     Boolean(canViewReports),
        canModerateContent: Boolean(canModerateContent),
        canViewAnalytics:   Boolean(canViewAnalytics),
        grantedBy:          req.user.id,
        grantedAt:          new Date(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Permissions updated', data: permissions });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke sub_admin role — revert to mentee
// @route   DELETE /api/permissions/:userId
// @access  Private (admin only)
export const revokeSubAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== 'sub_admin') {
      return res.status(404).json({ success: false, message: 'Sub Admin not found' });
    }

    user.role = 'mentee';
    await user.save();

    await Permission.findOneAndDelete({ user: userId });

    res.status(200).json({ success: true, message: `${user.name}'s sub admin access has been revoked` });
  } catch (error) {
    next(error);
  }
};
