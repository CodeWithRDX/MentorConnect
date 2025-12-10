import Issue from '../models/Issue.js';

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

// Update status/priority (admin only)
export const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// Add remarks to issue (admin only)
export const addRemarks = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    if (!remarks) {
      return res.status(400).json({ success: false, message: 'Remarks are required' });
    }
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { remarks },
      { new: true, runValidators: true },
    );
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// Mark issue as in progress (admin only)
export const markInProgress = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: 'in_progress' },
      { new: true, runValidators: true },
    );
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// Close issue (admin only)
export const closeIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};


