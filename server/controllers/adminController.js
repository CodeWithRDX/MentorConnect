import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';
import Issue from '../models/Issue.js';
import jwt from 'jsonwebtoken';

/* =========================================================
   ADMIN LOGIN (POST /api/admin/login)
   PUBLIC ROUTE
========================================================= */
export const adminLogin = async (req, res) => {
  try {
    console.log("🔥 ADMIN LOGIN BODY:", req.body);

    const { email, password } = req.body;

    // Find admin user and explicitly select password
    // Need password field for comparison (schema excludes by default)
    const user = await User.findOne({ email }).select('+password');
    console.log("🔍 ADMIN USER FOUND:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if admin
    console.log("👀 USER ROLE:", user.role);

    if (user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Admin access only",
      });
    }

    // Verify password
    // Reuse shared password compare helper to avoid drift
    const isMatch = await user.comparePassword(password);
    console.log("🔑 PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("✅ LOGIN SUCCESS — Generating JWT");

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    // Mirror user login behavior: set httpOnly cookie so admin routes work with protect middleware
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("💥 ADMIN LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


/* =========================================================
   GET ALL USERS
========================================================= */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('mentorProfile');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
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
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    mentor.isApproved = true;
    mentor.approvedAt = new Date();
    mentor.approvedBy = req.user.id;
    await mentor.save();

    // Attach approved mentor to user profile
    await User.findByIdAndUpdate(mentor.user, { mentorProfile: mentor._id });

    res.status(200).json({
      success: true,
      message: 'Mentor approved successfully',
      data: mentor,
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
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.mentorProfile) {
      await Mentor.findByIdAndDelete(user.mentorProfile);
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL CATEGORIES
========================================================= */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CREATE CATEGORY
========================================================= */
export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE CATEGORY
========================================================= */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE CATEGORY
========================================================= */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DASHBOARD STATS
========================================================= */
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await Mentor.countDocuments();
    const approvedMentors = await Mentor.countDocuments({ isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments();
    const openIssues = await Issue.countDocuments({ status: { $in: ['open', 'in_progress'] } });

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
   GET ALL MENTORS
========================================================= */
export const getAllMentors = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const mentors = await Mentor.find(filter)
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors,
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
      .populate('menteeId', 'name email')
      .populate('mentorId', 'name email');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
