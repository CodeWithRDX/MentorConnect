import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Permission from '../models/Permission.js';

// ── Protect — verify JWT and attach user to req ──────────────────────────────
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_MISSING',
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Block suspended or banned users from accessing protected routes
    if (req.user.isBanned) {
      return res.status(403).json({
        success: false,
        code: 'USER_BANNED',
        message: 'Your account has been banned. Contact support.',
      });
    }

    if (req.user.isSuspended && req.user.suspendedUntil && req.user.suspendedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        code: 'USER_SUSPENDED',
        message: `Your account is suspended until ${req.user.suspendedUntil.toISOString()}. Reason: ${req.user.suspendedReason || 'Violation of terms'}`,
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Not authorized to access this route',
    });
  }
};

// ── Authorize — check user role ───────────────────────────────────────────────
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'ROLE_UNAUTHORIZED',
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// ── Authorize With Permission — RBAC for sub_admin ────────────────────────────
// Super admins always pass. Sub admins must have the specific permission flag.
export const authorizeWithPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      // Super admin bypasses all permission checks
      if (req.user.role === 'admin') return next();

      // Only admin and sub_admin can reach admin routes
      if (req.user.role !== 'sub_admin') {
        return res.status(403).json({
          success: false,
          code: 'ROLE_UNAUTHORIZED',
          message: 'Insufficient privileges to access this route',
        });
      }

      // Look up sub_admin permissions
      const permissions = await Permission.findOne({ user: req.user.id });

      if (!permissions || !permissions[permissionKey]) {
        return res.status(403).json({
          success: false,
          code: 'PERMISSION_DENIED',
          message: `You do not have permission: ${permissionKey}`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};