import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token received from cookies:', token); // Debug log
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token received from Authorization header:', token); // Debug log
  } else {
    console.log('No token provided'); // Debug log
    return res.status(401).json({
      success: false,
      code: 'TOKEN_MISSING',
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
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