import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').populate('mentorProfile');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve mentor
// @route   PUT /api/admin/mentor/approve/:id
// @access  Private/Admin
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

    res.status(200).json({
      success: true,
      message: 'Mentor approved successfully',
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete mentor profile if exists
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

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
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

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
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

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
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

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
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

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await Mentor.countDocuments();
    const approvedMentors = await Mentor.countDocuments({ isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMentors,
        approvedMentors,
        pendingMentors: totalMentors - approvedMentors,
        totalBookings,
        totalCategories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all mentors
// @route   GET /api/admin/all-mentors
// @access  Private/Admin
export const getAllMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find().populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/all-bookings
// @access  Private/Admin
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
