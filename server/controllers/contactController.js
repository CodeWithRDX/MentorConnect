import ContactMessage from '../models/ContactMessage.js';
import sendEmail from '../utils/sendEmail.js';

// -----------------------------------------------------------------------
// POST /api/contact  (public — no auth required)
// Submit a contact form message
// -----------------------------------------------------------------------
export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required.',
            });
        }

        // Save to database
        const contact = await ContactMessage.create({ name, email, subject, message });

        // ── Notify admin ────────────────────────────────────────────────────
        try {
            await sendEmail({
                email: process.env.EMAIL_USER,          // admin inbox
                subject: `[MentorConnect] New Contact Message: ${subject || 'General Inquiry'}`,
                message: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#0284c7">New Contact Message</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#555;font-weight:bold;width:100px">From:</td>
                  <td style="padding:6px 0">${name} &lt;${email}&gt;</td></tr>
              <tr><td style="padding:6px 0;color:#555;font-weight:bold">Subject:</td>
                  <td style="padding:6px 0">${subject || 'General Inquiry'}</td></tr>
              <tr><td style="padding:6px 0;color:#555;font-weight:bold">Date:</td>
                  <td style="padding:6px 0">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
            </table>
            <div style="background:#f5f5f5;padding:16px;border-radius:6px;border-left:4px solid #0284c7;">
              <p style="margin:0;white-space:pre-line;color:#333">${message}</p>
            </div>
            <hr style="margin-top:24px;border:none;border-top:1px solid #e5e5e5">
            <p style="color:#aaa;font-size:12px">MentorConnect · Contact Form Submission #${contact._id}</p>
          </div>
        `,
            });
        } catch (mailErr) {
            // Don't fail the request if email fails — message is still saved in DB
            console.error('[Contact] Admin notification email failed:', mailErr.message);
        }

        // ── Auto-acknowledge sender ─────────────────────────────────────────
        try {
            await sendEmail({
                email,
                subject: 'We received your message – MentorConnect',
                message: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#0284c7">Hi ${name}, we got your message!</h2>
            <p>Thanks for reaching out to MentorConnect. Our team will review your message and get back to you within <strong>24 hours</strong>.</p>
            <div style="background:#f5f5f5;padding:16px;border-radius:6px;border-left:4px solid #0284c7;margin:16px 0;">
              <p style="margin:0;font-weight:bold;color:#555">Your message:</p>
              <p style="margin:8px 0 0;white-space:pre-line;color:#333">${message}</p>
            </div>
            <p style="color:#555">If this is urgent, you can also reach us directly at
               <a href="mailto:support@mentorconnect.com" style="color:#0284c7">support@mentorconnect.com</a>.</p>
            <hr style="border:none;border-top:1px solid #e5e5e5;margin-top:24px">
            <p style="color:#aaa;font-size:12px">MentorConnect – Connecting you with the right mentor.</p>
          </div>
        `,
            });
        } catch (mailErr) {
            console.error('[Contact] Auto-acknowledge email failed:', mailErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been received. We\'ll be in touch within 24 hours!',
            data: { id: contact._id },
        });
    } catch (error) {
        next(error);
    }
};

// -----------------------------------------------------------------------
// GET /api/contact  (admin only)
// List all contact messages with optional status filter
// -----------------------------------------------------------------------
export const listContactMessages = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const messages = await ContactMessage.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};

// -----------------------------------------------------------------------
// PATCH /api/contact/:id/status  (admin only)
// Mark a message as read or replied
// -----------------------------------------------------------------------
export const updateContactStatus = async (req, res, next) => {
    try {
        const { status, adminReply } = req.body;

        const update = {};
        if (status) update.status = status;
        if (adminReply !== undefined) {
            update.adminReply = adminReply;
            update.repliedAt = new Date();
            update.status = 'replied';
        }

        const contact = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true },
        );

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        // Send reply email to the original sender
        if (adminReply) {
            try {
                await sendEmail({
                    email: contact.email,
                    subject: `Re: ${contact.subject} – MentorConnect`,
                    message: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#0284c7">Reply from MentorConnect</h2>
              <p>Hi <strong>${contact.name}</strong>,</p>
              <p>Thanks for reaching out. Here is our reply to your message:</p>
              <div style="background:#f5f5f5;padding:16px;border-radius:6px;border-left:4px solid #0284c7;margin:16px 0;">
                <p style="margin:0;white-space:pre-line;color:#333">${adminReply}</p>
              </div>
              <p style="color:#555;font-size:13px">Your original message:<br>
                <em style="color:#888">${contact.message}</em></p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin-top:24px">
              <p style="color:#aaa;font-size:12px">MentorConnect – Connecting you with the right mentor.</p>
            </div>
          `,
                });
            } catch (mailErr) {
                console.error('[Contact] Reply email failed:', mailErr.message);
            }
        }

        res.status(200).json({ success: true, data: contact });
    } catch (error) {
        next(error);
    }
};

// -----------------------------------------------------------------------
// DELETE /api/contact/:id  (admin only)
// -----------------------------------------------------------------------
export const deleteContactMessage = async (req, res, next) => {
    try {
        const contact = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }
        res.status(200).json({ success: true, message: 'Message deleted.' });
    } catch (error) {
        next(error);
    }
};
