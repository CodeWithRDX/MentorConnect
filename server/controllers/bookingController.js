import Booking from '../models/Booking.js';
import Mentor from '../models/Mentor.js';
import User from '../models/User.js';
import CallSession from '../models/CallSession.js';
import sendEmail from '../utils/sendEmail.js';
import sseService from '../services/sseService.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { mentor, sessionDate, sessionTime = {}, duration, notes } = req.body;

    const mentorDoc = await Mentor.findById(mentor);
    if (!mentorDoc) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    const effectiveDuration = duration || 60;

    // Auto-calculate session end time if not provided
    let finalSessionTime = sessionTime;
    if (!sessionTime.end && sessionTime.start) {
      const [startHourStr, startMinStr] = sessionTime.start.split(':');
      const startMinutes = parseInt(startHourStr, 10) * 60 + parseInt(startMinStr, 10);
      const endMinutes = startMinutes + effectiveDuration;
      const endHour = Math.floor((endMinutes % (24 * 60)) / 60)
        .toString()
        .padStart(2, '0');
      const endMin = (endMinutes % 60).toString().padStart(2, '0');

      finalSessionTime = {
        ...sessionTime,
        end: `${endHour}:${endMin}`,
      };
    }

    // Check Mentor Availability
    const date = new Date(sessionDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = mentorDoc.availability?.[dayName];

    let isAvailable = false;
    if (dayAvailability && dayAvailability.length > 0) {
      // Simple check: booking start time must exist in one of the slots
      // Ideally we should check if the FULL duration fits, but for now we check start time overlap
      // A more robust check would convert everything to minutes.
      const bookingStartMinutes = parseInt(finalSessionTime.start.split(':')[0]) * 60 + parseInt(finalSessionTime.start.split(':')[1]);
      const bookingEndMinutes = bookingStartMinutes + effectiveDuration;

      for (const slot of dayAvailability) {
        const slotStartMinutes = parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]);
        const slotEndMinutes = parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1]);

        if (bookingStartMinutes >= slotStartMinutes && bookingEndMinutes <= slotEndMinutes) {
          isAvailable = true;
          break;
        }
      }
    } else {
      // If no availability set, default 9-5 (09:00 - 17:00)
      const bookingStartMinutes = parseInt(finalSessionTime.start.split(':')[0]) * 60 + parseInt(finalSessionTime.start.split(':')[1]);
      const bookingEndMinutes = bookingStartMinutes + effectiveDuration;
      const defaultStart = 9 * 60; // 09:00
      const defaultEnd = 17 * 60; // 17:00

      if (bookingStartMinutes >= defaultStart && bookingEndMinutes <= defaultEnd) {
        isAvailable = true;
      }
    }

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is not available at this time. Please check mentor availability.',
      });
    }

    const amount = (effectiveDuration / 60) * mentorDoc.hourlyRate;

    const booking = await Booking.create({
      mentee: req.user.id,
      mentor,
      sessionDate,
      sessionTime: finalSessionTime,
      duration: effectiveDuration,
      amount,
      notes,
    });

    // Send real-time SSE notification & email to mentor
    try {
      const mentorUser = await User.findById(mentorDoc.user);
      const menteeUser = await User.findById(req.user.id);

      if (mentorDoc.user) {
        sseService.createAndSendNotification({
          recipient: mentorDoc.user,
          sender: req.user.id,
          type: 'booking',
          title: 'New Mentorship Booking Request',
          message: `${menteeUser?.name || 'A mentee'} booked a ${effectiveDuration}-min session for ${new Date(sessionDate).toLocaleDateString()}.`,
          link: '/mentor/dashboard',
          metadata: { bookingId: booking._id },
        });
      }

      await sendEmail({
        email: mentorUser.email,
        subject: 'New Booking Request',
        message: `
              <h1>New Booking Request</h1>
              <p>You have a new booking request from ${menteeUser.name}.</p>
              <p>Date: ${new Date(sessionDate).toDateString()}</p>
              <p>Time: ${finalSessionTime.start} - ${finalSessionTime.end}</p>
              <p>Please log in to your dashboard to approve or reject this request.</p>
            `,
      });
    } catch (err) {
      console.error('Notification / Email error on booking creation', err);
    }

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
      .populate({
        path: 'mentor',
        select: 'user hourlyRate',
        populate: {
          path: 'user',
          select: 'name email avatar',
        },
      })
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
    // Prefer explicit route param, fallback to authenticated mentor id
    const mentorId =
      req.params?.id ||
      req.user?.mentorId ||
      req.user?.mentorProfile ||
      req.user?.id;

    const bookings = await Booking.find({ mentor: mentorId })
      .populate('mentee', 'name email avatar')
      .populate({
        path: 'mentor',
        populate: {
          path: 'user',
          select: 'name email avatar',
        },
      })
      .sort({ createdAt: -1 });

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

    // Permanently Delete instead of marking cancelled
    await booking.deleteOne();

    // Notify Mentor
    try {
      const mentor = await Mentor.findById(booking.mentor).populate('user');
      if (mentor && mentor.user) {
        await sendEmail({
          email: mentor.user.email,
          subject: 'Booking Cancelled',
          message: `<p>A booking (ID: ${booking._id}) has been cancelled by the mentee.</p>`,
        });
      }
    } catch (err) {
      console.error('Email error', err);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and removed successfully',
      data: {},
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


// @desc    Approve booking
// @route   PUT /api/bookings/:id/approve
// @access  Private (Mentor only)
export const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor || booking.mentor.toString() !== mentor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this booking' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Email Mentee
    try {
      const mentee = await User.findById(booking.mentee);
      await sendEmail({
        email: mentee.email,
        subject: 'Booking Confirmed!',
        message: `<h1>Booking Approved</h1><p>Your booking with ${req.user.name} has been confirmed.</p>`,
      });
    } catch (err) { console.error('Email error', err); }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (Mentor only)
export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor || booking.mentor.toString() !== mentor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this booking' });
    }

    booking.status = 'rejected';
    await booking.save();

    // Email Mentee
    try {
      const mentee = await User.findById(booking.mentee);
      await sendEmail({
        email: mentee.email,
        subject: 'Booking Rejected',
        message: `<h1>Booking Update</h1><p>Your booking with ${req.user.name} was rejected.</p>`,
      });
    } catch (err) { console.error('Email error', err); }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active call session for a booking
// @route   GET /api/bookings/:id/active-call
// @access  Private
export const getActiveCallSession = async (req, res, next) => {
  try {
    const activeCall = await CallSession.findOne({
      booking: req.params.id,
      status: { $in: ['initiated', 'ringing', 'active'] },
    }).populate('caller', 'name avatar');

    res.status(200).json({
      success: true,
      data: activeCall,
    });
  } catch (error) {
    next(error);
  }
};
