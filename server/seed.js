import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Mentor from './models/Mentor.js';
import Category from './models/Category.js';
import Booking from './models/Booking.js';
import Issue from './models/Issue.js';

dotenv.config();

const seedData = async () => {
  try {
    const envUri = process.env.MONGODB_URI?.trim() || 'mongodb://localhost:27017/mentorconnect';
    await mongoose.connect(envUri);
    console.log(`✅ Connected to MongoDB @ ${envUri}`);

    // Clear existing data
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await Category.deleteMany({});
    await Booking.deleteMany({});
    await Issue.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Software Development', description: 'Programming and software engineering' },
      { name: 'Product Management', description: 'Product strategy and management' },
      { name: 'Data Science', description: 'Data analysis and machine learning' },
      { name: 'Design', description: 'UI/UX and graphic design' },
      { name: 'Marketing', description: 'Digital marketing and growth' },
      { name: 'Career Coaching', description: 'Career development and guidance' },
    ]);

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@mentorconnect.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
    });

    await admin.save();

    // Create mentor users
    const mentorUsers = await User.insertMany([
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'mentor',
        isEmailVerified: true,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: hashedPassword,
        role: 'mentor',
        isEmailVerified: true,
      },
      {
        name: 'Michael Chen',
        email: 'michael@example.com',
        password: hashedPassword,
        role: 'mentor',
        isEmailVerified: true,
      },
    ]);

    // Create mentor profiles
    const mentors = await Mentor.insertMany([
      {
        user: mentorUsers[0]._id,
        bio: 'Senior software engineer with 10+ years of experience in full-stack development. Specialized in React, Node.js, and cloud architecture.',
        skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'MongoDB'],
        categories: ['Software Development'],
        experience: 10,
        hourlyRate: 75,
        rating: 4.8,
        totalReviews: 25,
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: admin._id,
        languages: ['English', 'Spanish'],
      },
      {
        user: mentorUsers[1]._id,
        bio: 'Product manager with expertise in B2B SaaS products. Helped scale multiple products from 0 to millions in revenue.',
        skills: ['Product Strategy', 'Roadmapping', 'User Research', 'Analytics'],
        categories: ['Product Management'],
        experience: 8,
        hourlyRate: 90,
        rating: 4.9,
        totalReviews: 18,
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: admin._id,
        languages: ['English'],
      },
      {
        user: mentorUsers[2]._id,
        bio: 'Data scientist and ML engineer. Expert in Python, TensorFlow, and building production ML systems.',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
        categories: ['Data Science'],
        experience: 7,
        hourlyRate: 85,
        rating: 4.7,
        totalReviews: 15,
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: admin._id,
        languages: ['English', 'Mandarin'],
      },
    ]);

    // Link mentor profiles to users
    for (let i = 0; i < mentorUsers.length; i++) {
      mentorUsers[i].mentorProfile = mentors[i]._id;
      await mentorUsers[i].save();
    }

    // Create a mentee user
    const mentee = await User.create({
      name: 'Emily Rodriguez',
      email: 'emily@example.com',
      password: hashedPassword,
      role: 'mentee',
      isEmailVerified: true,
    });

    // Create a pending mentor user/profile for admin approval demo
    const pendingMentorUser = await User.create({
      name: 'Pending Mentor',
      email: 'pending.mentor@example.com',
      password: hashedPassword,
      role: 'mentor',
      isEmailVerified: true,
    });

    const pendingMentorProfile = await Mentor.create({
      user: pendingMentorUser._id,
      bio: 'Aspiring mentor awaiting approval.',
      skills: ['Leadership', 'Communication'],
      categories: ['Career Coaching'],
      experience: 2,
      hourlyRate: 40,
      isApproved: false,
      languages: ['English'],
    });

    pendingMentorUser.mentorProfile = pendingMentorProfile._id;
    await pendingMentorUser.save();

    // Create sample bookings for dashboards
    const now = new Date();
    const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    await Booking.insertMany([
      {
        mentee: mentee._id,
        mentor: mentors[0]._id,
        sessionDate: future,
        sessionTime: { start: '10:00', end: '11:00' },
        duration: 60,
        amount: 75,
        status: 'confirmed',
        paymentStatus: 'paid',
        meetingLink: 'https://meet.example.com/future',
      },
      {
        mentee: mentee._id,
        mentor: mentors[1]._id,
        sessionDate: past,
        sessionTime: { start: '14:00', end: '15:00' },
        duration: 60,
        amount: 90,
        status: 'completed',
        paymentStatus: 'paid',
        meetingLink: 'https://meet.example.com/past',
        review: { rating: 5, comment: 'Great session', createdAt: past },
      },
    ]);

    // Seed a couple of issues for admin dashboard
    await Issue.insertMany([
      {
        user: mentee._id,
        role: 'mentee',
        title: 'Payment not processed',
        description: 'Booked a session but payment still pending.',
        type: 'payment',
        priority: 'high',
        status: 'open',
      },
      {
        user: mentorUsers[0]._id,
        role: 'mentor',
        title: 'Video call link broken',
        description: 'Unable to access the meeting link for my session.',
        type: 'technical',
        priority: 'medium',
        status: 'in_progress',
      },
    ]);

    console.log('🎉 Seed data created successfully!');
    console.log('Admin login: admin@mentorconnect.com / admin123');
    console.log('Mentor login: john@example.com / admin123');
    console.log('Mentee login: emily@example.com / admin123');
    console.log('Pending mentor: pending.mentor@example.com / admin123');
    console.log('Sample bookings and issues created for dashboard data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
