import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Prefer env override but fall back to local dev database to avoid undefined URI crashes
    const envUri = process.env.MONGODB_URI?.trim();
    const mongoUri = envUri || 'mongodb://localhost:27017/mentorconnect';

    // Warn (not crash) when falling back so developers know to configure .env
    if (!envUri) {
      console.warn('MONGODB_URI not set; using default mongodb://localhost:27017/mentorconnect');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

