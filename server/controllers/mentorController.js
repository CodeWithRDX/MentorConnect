import Mentor from '../models/Mentor.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
export const getMentors = async (req, res, next) => {
  try {
    const { category, skill, rating, search, page = 1, limit = 10, isApproved } = req.query;

    const query = {};
    if (isApproved === undefined) {
      query.isApproved = true;
    } else {
      query.isApproved = isApproved === 'true';
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    if (skill) {
      query.skills = { $in: [skill] };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (search) {
      query.$or = [
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const mentors = await Mentor.find(query)
      .populate('user', 'name email avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Mentor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: mentors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: mentors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
export const getMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('approvedBy', 'name');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to become mentor
// @route   POST /api/mentors/apply
// @access  Private
export const applyMentor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'mentor') {
      return res.status(400).json({
        success: false,
        message: 'User role must be mentor',
      });
    }

    if (user.mentorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mentor profile already exists',
      });
    }

    const mentor = await Mentor.create({
      ...req.body,
      user: req.user.id,
    });

    user.mentorProfile = mentor._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Mentor application submitted successfully',
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/:id
// @access  Private
export const updateMentor = async (req, res, next) => {
  try {
    let mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // Check ownership or admin
    if (mentor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this mentor profile',
      });
    }

    mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mentors by category
// @route   GET /api/mentors/category/:category
// @access  Public
export const getMentorsByCategory = async (req, res, next) => {
  try {
    const mentors = await Mentor.find({
      categories: { $in: [req.params.category] },
      isApproved: true,
    })
      .populate('user', 'name email avatar')
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top mentors by number of bookings
// @route   GET /api/mentors/top
// @access  Public
export const getTopMentors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const pipeline = [
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      {
        $group: {
          _id: '$mentor',
          bookingsCount: { $sum: 1 },
          lastBookingAt: { $max: '$createdAt' },
        },
      },
      {
        $sort: {
          bookingsCount: -1,
          lastBookingAt: -1,
        },
      },
      { $limit: limit },
      {
        $lookup: {
          from: 'mentors',
          localField: '_id',
          foreignField: '_id',
          as: 'mentor',
        },
      },
      { $unwind: '$mentor' },
      {
        $match: {
          'mentor.isApproved': true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentor.user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$mentor._id',
          bookingsCount: 1,
          rating: '$mentor.rating',
          totalReviews: '$mentor.totalReviews',
          hourlyRate: '$mentor.hourlyRate',
          categories: '$mentor.categories',
          skills: '$mentor.skills',
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            avatar: '$user.avatar',
          },
        },
      },
    ];

    const topMentors = await Booking.aggregate(pipeline);

    // If there are no bookings yet (or not enough top mentors), fill with random approved mentors
    const existingIds = topMentors.map((m) => m._id);
    const remainingCount = Math.max(0, limit - topMentors.length);

    let fallbackMentors = [];
    if (remainingCount > 0) {
      fallbackMentors = await Mentor.aggregate([
        {
          $match: {
            isApproved: true,
            ...(existingIds.length ? { _id: { $nin: existingIds } } : {}),
          },
        },
        { $sample: { size: remainingCount } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            bookingsCount: { $literal: 0 },
            rating: 1,
            totalReviews: 1,
            hourlyRate: 1,
            categories: 1,
            skills: 1,
            user: {
              _id: '$user._id',
              name: '$user.name',
              email: '$user.email',
              avatar: '$user.avatar',
            },
          },
        },
      ]);
    }

    const data = [...topMentors, ...fallbackMentors].slice(0, limit);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};


