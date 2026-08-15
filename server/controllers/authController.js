import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { emailVerificationTemplate, passwordResetTemplate } from '../utils/emailTemplates.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// ── Helper: set auth cookie + return response ────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Return access token in JSON body
  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        id:  user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        mentorProfile: user.mentorProfile,
        oauthProviders: (user.oauthProviders || []).map(p => ({ provider: p.provider })),
      },
      token,
      refreshToken,
    },
  });
};

// @desc    Get user by ID
// @route   GET /api/auth/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (role && !['mentee', 'mentor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be mentee or mentor',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'mentee',
      isEmailVerified: process.env.SKIP_EMAIL_VERIFICATION === 'true',
    });

    // Generate email verification token
    let token = null;
    if (process.env.SKIP_EMAIL_VERIFICATION !== 'true') {
      token = user.generateEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
    }

    // Send verification email
    if (process.env.SKIP_EMAIL_VERIFICATION !== 'true') {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification - MentorConnect',
          message: emailVerificationTemplate(user.name, token),
        });

        return res.status(201).json({
          success: true,
          message: 'Registration successful. Please check your email to verify your account.',
          data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
        });
      } catch {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
          success: false,
          message: 'Email could not be sent. Please try again later.',
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password').populate('mentorProfile');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Block OAuth-only users from password login
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please use the Google button to log in.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Admins use the admin portal
    if (user.role === 'admin' || user.role === 'sub_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts must log in via the admin portal.',
      });
    }

    // Update login tracking
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.signedCookies?.refreshToken ||
      req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: 'REFRESH_TOKEN_MISSING',
        message: 'Refresh token is missing',
      });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Invalid or expired refresh token. Please login again.',
      });
    }

    const user = await User.findById(decoded.id).populate('mentorProfile');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Generate new tokens
    const token = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      expires: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    };

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        refreshToken: newRefreshToken,
        user: {
          _id: user._id,
          id:  user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          socialLinks: user.socialLinks,
          preferences: user.preferences,
          mentorProfile: user.mentorProfile,
          oauthProviders: (user.oauthProviders || []).map(p => ({ provider: p.provider })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('mentorProfile');

  res.status(200).json({ success: true, data: { user } });
};

// @desc    Update user profile (name, bio, phone, avatar, socialLinks)
// @route   PUT /api/auth/profile/update
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, bio, phone, socialLinks } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio.slice(0, 500);
    if (phone !== undefined) user.phone = phone;
    if (socialLinks && typeof socialLinks === 'object') {
      user.socialLinks = {
        linkedin: socialLinks.linkedin || user.socialLinks?.linkedin || '',
        twitter:  socialLinks.twitter  || user.socialLinks?.twitter  || '',
        website:  socialLinks.website  || user.socialLinks?.website  || '',
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          id:  user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          socialLinks: user.socialLinks,
          preferences: user.preferences,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences (notifications, theme, timezone)
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { emailNotifications, sessionReminders, marketingEmails, theme, timezone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.preferences) user.preferences = {};

    if (emailNotifications !== undefined) user.preferences.emailNotifications = Boolean(emailNotifications);
    if (sessionReminders   !== undefined) user.preferences.sessionReminders   = Boolean(sessionReminders);
    if (marketingEmails    !== undefined) user.preferences.marketingEmails    = Boolean(marketingEmails);
    if (theme && ['light', 'dark', 'system'].includes(theme)) user.preferences.theme = theme;
    if (timezone) user.preferences.timezone = timezone;

    user.markModified('preferences');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in and has no password to change.',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Please provide verification token' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - MentorConnect',
        message: passwordResetTemplate(user.name, token),
      });

      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Please provide token and password' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
