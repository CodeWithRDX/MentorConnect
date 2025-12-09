import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Mentor from './models/Mentor.js';
import Category from './models/Category.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Software Development', description: 'Programming and software engineering' },
      { name: 'Product Management', description: 'Product strategy and management' },
      { name: 'Data Science', description: 'Data analysis and machine learning' },
      { name: 'Design', description: 'UI/UX and graphic design' },
      { name: 'Marketing', description: 'Digital marketing and growth' },
      { name: 'Career Coaching', description: 'Career development and guidance' },
    ]);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@mentorconnect.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
    });

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

    // Update users with mentor profiles
    for (let i = 0; i < mentorUsers.length; i++) {
      mentorUsers[i].mentorProfile = mentors[i]._id;
      await mentorUsers[i].save();
    }

    // Create mentee user
    await User.create({
      name: 'Emily Rodriguez',
      email: 'emily@example.com',
      password: hashedPassword,
      role: 'mentee',
      isEmailVerified: true,
    });

    console.log('Seed data created successfully!');
    console.log('Admin credentials: admin@mentorconnect.com / admin123');
    console.log('Mentor credentials: john@example.com / admin123');
    console.log('Mentee credentials: emily@example.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

