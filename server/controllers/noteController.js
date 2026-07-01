import Note from '../models/Note.js';
import Booking from '../models/Booking.js';

// ── Helper: verify user is a participant in the booking ──────────────────────
const verifyParticipant = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId).populate('mentor', 'user');
  if (!booking) return null;

  const menteeId = booking.mentee?.toString();
  const mentorUserId = booking.mentor?.user?.toString();

  if (userId !== menteeId && userId !== mentorUserId) return null;
  return booking;
};

// @desc    Get note for a booking session
// @route   GET /api/notes/:bookingId
// @access  Private (session participants only)
export const getNote = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await verifyParticipant(bookingId, userId);
    if (!booking) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a participant in this session.' });
    }

    let note = await Note.findOne({ booking: bookingId }).populate('lastEditedBy', 'name avatar');

    if (!note) {
      // Return an empty note (create on first GET so there's always a document)
      note = await Note.create({ booking: bookingId, content: '', lastEditedBy: userId });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/update note for a booking session
// @route   PUT /api/notes/:bookingId
// @access  Private (session participants only)
export const saveNote = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (content === undefined) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const booking = await verifyParticipant(bookingId, userId);
    if (!booking) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a participant in this session.' });
    }

    const note = await Note.findOneAndUpdate(
      { booking: bookingId },
      {
        content: content.slice(0, 50000),
        lastEditedBy: userId,
        updatedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('lastEditedBy', 'name avatar');

    res.status(200).json({ success: true, message: 'Note saved', data: note });
  } catch (error) {
    next(error);
  }
};
