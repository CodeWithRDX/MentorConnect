import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate env file relative to the script directory (which is always inside server/scripts/)
const envPath = path.resolve(__dirname, '../.env');
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

    // Assign plain password; schema pre-save hook will hash once
    user.password = newPassword;

    await user.save();

    console.log(`Password updated for ${email}. You can now login with the new password.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

run();
