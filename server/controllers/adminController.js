import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';
import Issue from '../models/Issue.js';
import Permission from '../models/Permission.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/* =========================================================
   ADMIN LOGIN (POST /api/admin/login)
   PUBLIC ROUTE — also handles sub_admin login
========================================================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!['admin', 'sub_admin'].includes(user.role)) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin access only' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'This account uses OAuth. Password login not available.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'This account has been banned.' });
    }

    // Fetch permissions for sub_admin
    let permissions = null;
    if (user.role === 'sub_admin') {
      permissions = await Permission.findOne({ user: user._id });
    }

    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const cookieOptions = {
      expires: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Update login tracking
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      user: {
        id:   user._id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
      permissions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/* =========================================================
   GET ALL USERS — paginated, searchable, filterable
   GET /api/admin/users?page=1&limit=20&search=john&role=mentee&status=active
========================================================= */
export const getUsers = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const role   = req.query.role;
    const status = req.query.status;

    const filter = {};

    // Text search across name and email
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role && ['mentee', 'mentor', 'admin', 'sub_admin'].includes(role)) {
      filter.role = role;
    }

    // Filter by account status
    if (status === 'active')    filter.isActive    = true;
    if (status === 'inactive')  filter.isActive    = false;
    if (status === 'suspended') filter.isSuspended = true;
    if (status === 'banned')    filter.isBanned    = true;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerificationToken -resetPasswordToken')
        .populate('mentorProfile', 'isApproved rating hourlyRate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE USER STATUS — activate / suspend / ban
   PUT /api/admin/user/:id/status
========================================================= */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, isSuspended, isBanned, suspendedReason, suspendedUntil } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent modifying another admin
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify admin accounts' });
    }

    if (isActive    !== undefined) user.isActive    = Boolean(isActive);
    if (isSuspended !== undefined) user.isSuspended = Boolean(isSuspended);
    if (isBanned    !== undefined) user.isBanned    = Boolean(isBanned);
    if (suspendedReason !== undefined) user.suspendedReason = suspendedReason;
    if (suspendedUntil  !== undefined) user.suspendedUntil  = suspendedUntil ? new Date(suspendedUntil) : null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        isActive:    user.isActive,
        isSuspended: user.isSuspended,
        isBanned:    user.isBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE USER ROLE
   PUT /api/admin/user/:id/role
========================================================= */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['mentee', 'mentor', 'sub_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be mentee, mentor, or sub_admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot change admin role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: { role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RESET USER PASSWORD — generate temp password + email
   POST /api/admin/user/:id/reset-password
========================================================= */
export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate a random temp password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(tempPassword, salt);
    await user.save({ validateBeforeSave: false });

    // Send email with temp password
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset by Admin — MentorConnect',
        message: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2>Your password has been reset</h2>
            <p>Hello ${user.name},</p>
            <p>An admin has reset your MentorConnect password. Here is your temporary password:</p>
            <div style="background:#f4f4f4;padding:16px;border-radius:8px;font-size:20px;font-weight:bold;text-align:center;letter-spacing:2px">
              ${tempPassword}
            </div>
            <p>Please log in and change your password immediately in Profile Settings.</p>
          </div>
        `,
      });
    } catch {
      // Password still reset even if email fails
    }

    res.status(200).json({ success: true, message: 'Password reset. User will receive a new password via email.' });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET USER ACTIVITY — bookings and sessions
   GET /api/admin/user/:id/activity
========================================================= */
export const getUserActivity = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email role lastLoginAt loginCount createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bookings = await Booking.find({
      $or: [
        { mentee: req.params.id },
        { mentor: { $in: await Mentor.find({ user: req.params.id }).distinct('_id') } },
      ],
    })
      .populate('mentor', 'bio')
      .populate('mentee', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        user,
        bookings,
        totalBookings: bookings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   APPROVE MENTOR
========================================================= */
export const approveMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    mentor.isApproved = true;
    mentor.approvedAt = new Date();
    mentor.approvedBy = req.user.id;
    await mentor.save();

    await User.findByIdAndUpdate(mentor.user, { mentorProfile: mentor._id });

    res.status(200).json({ success: true, message: 'Mentor approved successfully', data: mentor });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   REJECT MENTOR
========================================================= */
export const rejectMentor = async (req, res) => {
  try {
    const mentorId = req.params.id || req.params.mentorId;
    const result = await Mentor.findByIdAndDelete(mentorId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    if (result.user) {
      await User.findByIdAndUpdate(result.user, { $unset: { mentorProfile: 1 } });
    }

    res.status(200).json({ success: true, message: 'Mentor request rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject mentor request' });
  }
};

/* =========================================================
   UPDATE MENTOR DETAILS — admin edit
   PUT /api/admin/mentor/:id
========================================================= */
export const updateMentorDetails = async (req, res, next) => {
  try {
    const { bio, skills, categories, experience, hourlyRate, languages } = req.body;
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    if (bio        !== undefined) mentor.bio        = bio;
    if (skills     !== undefined) mentor.skills     = skills;
    if (categories !== undefined) mentor.categories = categories;
    if (experience !== undefined) mentor.experience = experience;
    if (hourlyRate !== undefined) mentor.hourlyRate = hourlyRate;
    if (languages  !== undefined) mentor.languages  = languages;

    await mentor.save();

    res.status(200).json({ success: true, message: 'Mentor updated successfully', data: mentor });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   TOGGLE MENTOR ACCOUNT — enable / disable without deleting
   PUT /api/admin/mentor/:id/toggle
========================================================= */
export const toggleMentorStatus = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    mentor.isApproved = !mentor.isApproved;
    if (mentor.isApproved) {
      mentor.approvedAt = new Date();
      mentor.approvedBy = req.user.id;
    }
    await mentor.save();

    res.status(200).json({
      success: true,
      message: `Mentor account ${mentor.isApproved ? 'enabled' : 'disabled'} successfully`,
      data: { isApproved: mentor.isApproved },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET MENTOR STATS
   GET /api/admin/mentor/:id/stats
========================================================= */
export const getMentorStats = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate('user', 'name email lastLoginAt loginCount createdAt');
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    const bookings = await Booking.find({ mentor: mentor._id });
    const completed = bookings.filter(b => b.status === 'completed');
    const totalEarnings = completed.reduce((sum, b) => sum + (b.amount || 0), 0);
    const reviews = completed.filter(b => b.review?.rating);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, b) => sum + b.review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        mentor,
        stats: {
          totalBookings:    bookings.length,
          completedSessions: completed.length,
          pendingBookings:  bookings.filter(b => b.status === 'pending').length,
          totalEarnings,
          avgRating:        Math.round(avgRating * 10) / 10,
          totalReviews:     reviews.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE USER
========================================================= */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.mentorProfile) {
      await Mentor.findByIdAndDelete(user.mentorProfile);
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CATEGORIES CRUD
========================================================= */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DASHBOARD STATS
========================================================= */
export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalMentors, approvedMentors, totalBookings, totalCategories, openIssues] =
      await Promise.all([
        User.countDocuments({ role: { $in: ['mentee', 'mentor'] } }),
        Mentor.countDocuments(),
        Mentor.countDocuments({ isApproved: true }),
        Booking.countDocuments(),
        Category.countDocuments(),
        Issue.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMentors,
        approvedMentors,
        pendingMentors: totalMentors - approvedMentors,
        totalBookings,
        totalCategories,
        openIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL MENTORS — paginated, filterable
========================================================= */
export const getAllMentors = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status === 'pending')  filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    let query = Mentor.find(filter)
      .populate('user', 'name email role lastLoginAt')
      .sort({ createdAt: -1 });

    const [mentors, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Mentor.countDocuments(filter),
    ]);

    // Client-side search on populated fields
    const filtered = search
      ? mentors.filter(m =>
          m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          m.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          m.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
        )
      : mentors;

    res.status(200).json({
      success: true,
      count: filtered.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL BOOKINGS
========================================================= */
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('mentee', 'name email')
      .populate({ path: 'mentor', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};
