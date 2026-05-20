import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Prefer env override but fall back to local dev database to avoid undefined URI crashes
    // Support both MONGODB_URI and MONGO_URI
    const envUri = (process.env.MONGODB_URI || process.env.MONGO_URI)?.trim();
    const mongoUri = envUri || 'mongodb://127.0.0.1:27017/mentorconnect';

    // Warn (not crash) when falling back so developers know to configure .env
    if (!envUri) {
      console.warn(`MONGODB_URI/MONGO_URI not set; using default ${mongoUri}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is required in production');
      }
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // In serverless, we don't want to kill the process immediately, 
    // but we do want to know if it failed. 
    // Rethrowing allows the caller to handle it.
    throw error;
  }
};

export default connectDB;

