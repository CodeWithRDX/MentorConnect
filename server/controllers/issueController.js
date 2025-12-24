import Issue from '../models/Issue.js';
import sendEmail from '../utils/sendEmail.js';

// Create issue (mentee/mentor/admin)
export const createIssue = async (req, res, next) => {
  try {
    const issue = await Issue.create({
      ...req.body,
      user: req.user.id,
      role: req.user.role,
    });
    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// List issues (admin sees all, others see own)
export const listIssues = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email role');
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    next(error);
  }
};

// Update status/priority/remark (admin only)
export const updateIssue = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status) update.status = req.body.status;
    if (req.body.priority) update.priority = req.body.priority;
    if (req.body.remark !== undefined) update.remark = req.body.remark;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true },
    ).populate('user', 'email name');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Send email to user
    try {
      await sendEmail({
        email: issue.user.email,
        subject: `Issue Updated: ${issue.title}`,
        message: `
                <h1>Issue Update</h1>
                <p>Your reported issue "<strong>${issue.title}</strong>" has been updated.</p>
                <p><strong>Status:</strong> ${issue.status}</p>
                <p><strong>Priority:</strong> ${issue.priority}</p>
                <p><strong>Remark:</strong> ${issue.remark || 'No remark'}</p>
            `,
      });
    } catch (err) {
      console.error('Email sending failed', err);
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};


