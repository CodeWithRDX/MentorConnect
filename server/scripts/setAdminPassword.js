import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Ensure we load the server .env (script may be run from project root)
const envPath = process.cwd().endsWith('/server')
  ? `${process.cwd()}/.env`
  : `${process.cwd()}/server/.env`;
dotenv.config({ path: envPath });

const run = async () => {
  try {
    await connectDB();

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: node server/scripts/setAdminPassword.js <email> <newPassword>');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found with email: ${email}`);
      process.exit(1);
    }

    // Ensure role is admin
    if (user.role !== 'admin') {
      console.log(`User found but role is '${user.role}'. Updating role to 'admin'.`);
      user.role = 'admin';
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    console.log(`Password updated for ${email}. You can now login with the new password.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

run();
