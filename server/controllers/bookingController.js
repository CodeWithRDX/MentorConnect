import Booking from '../models/Booking.js';
import Mentor from '../models/Mentor.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { mentor, sessionDate, sessionTime, duration, notes } = req.body;

    const mentorDoc = await Mentor.findById(mentor);
    if (!mentorDoc) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    const amount = (duration / 60) * mentorDoc.hourlyRate;

    const booking = await Booking.create({
      mentee: req.user.id,
      mentor,
      sessionDate,
      sessionTime,
      duration: duration || 60,
      amount,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user/:id
// @access  Private
export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ mentee: req.params.id })
      .populate('mentor', 'user hourlyRate')
      .populate('mentor.user', 'name email avatar')
      .sort({ sessionDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mentor bookings
// @route   GET /api/bookings/mentor/:id
// @access  Private
export const getMentorBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ mentor: req.params.id })
      .populate('mentee', 'name email avatar')
      .sort({ sessionDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership
    if (booking.mentee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete booking
// @route   PUT /api/bookings/:id/complete
// @access  Private
export const completeBooking = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.mentee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this booking',
      });
    }

    booking.status = 'completed';
    if (rating && comment) {
      booking.review = {
        rating,
        comment,
        createdAt: new Date(),
      };

      // Update mentor rating
      const mentor = await Mentor.findById(booking.mentor);
      const totalRating = mentor.rating * mentor.totalReviews;
      mentor.totalReviews += 1;
      mentor.rating = (totalRating + rating) / mentor.totalReviews;
      await mentor.save();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

