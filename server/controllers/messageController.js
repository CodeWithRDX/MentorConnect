import Message from '../models/Message.js';
import User from '../models/User.js';
import sseService from '../services/sseService.js';

// @desc    Send a message (simple one-to-one chat)
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { to, body } = req.body;

    if (!to || !body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message body are required',
      });
    }

    const message = await Message.create({
      from: req.user.id,
      to,
      body: body.trim(),
    });

    // Send real-time SSE notification to recipient
    const sender = await User.findById(req.user.id).select('name role');
    const senderRole = sender?.role === 'mentor' ? 'mentor' : 'mentee';
    const targetLink = senderRole === 'mentor' ? '/mentee/messages' : '/mentor/messages';

    sseService.createAndSendNotification({
      recipient: to,
      sender: req.user.id,
      type: 'message',
      title: `New message from ${sender?.name || 'User'}`,
      message: body.trim().length > 60 ? `${body.trim().substring(0, 60)}...` : body.trim(),
      link: targetLink,
      metadata: { messageId: message._id, from: req.user.id },
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation between current user and a specific user
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: otherUserId },
        { from: otherUserId, to: req.user.id },
      ],
    })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique chat contacts for current user with last message
// @route   GET /api/messages/contacts
// @access  Private
export const getContacts = async (req, res, next) => {
  try {
    const userId = req.user.id.toString();

    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const contactToLastMessage = new Map();

    messages.forEach((msg) => {
      const fromId = msg.from.toString();
      const toId = msg.to.toString();
      const otherId = fromId === userId ? toId : fromId;

      if (!contactToLastMessage.has(otherId)) {
        contactToLastMessage.set(otherId, msg);
      }
    });

    const contactIds = Array.from(contactToLastMessage.keys());

    if (contactIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const users = await User.find({ _id: { $in: contactIds } })
      .select('name email avatar role')
      .lean();

    const contacts = users.map((u) => {
      const lastMsg = contactToLastMessage.get(u._id.toString());
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        lastMessage: lastMsg?.body || '',
        lastMessageAt: lastMsg?.createdAt || null,
      };
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};


