import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            enum: [
                'General Inquiry',
                'Mentor Application',
                'Billing / Payment',
                'Technical Issue',
                'Partnership',
                'Other',
            ],
            default: 'General Inquiry',
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
        },
        adminReply: {
            type: String,
            trim: true,
        },
        repliedAt: {
            type: Date,
        },
    },
    { timestamps: true },
);

export default mongoose.model('ContactMessage', contactMessageSchema);
