import dotenv from 'dotenv';

// Pre-load env variables to ensure we can validate them
dotenv.config();

/**
 * Validates that all required environment variables are present and correctly formatted.
 * Exits the process if validation fails.
 */
export const validateEnv = () => {
  const required = [
    { name: 'JWT_SECRET', minLength: 32 },
    { name: 'FRONTEND_URL' }
  ];

  const missing = [];
  const invalid = [];

  // Check MONGODB_URI or MONGO_URI
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    missing.push('MONGODB_URI or MONGO_URI');
  }

  required.forEach((variable) => {
    const value = process.env[variable.name];
    if (!value) {
      missing.push(variable.name);
    } else if (variable.minLength && value.length < variable.minLength) {
      invalid.push(`${variable.name} must be at least ${variable.minLength} characters long`);
    }
  });

  if (missing.length > 0 || invalid.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '=== ENVIRONMENT VARIABLE VALIDATION ERROR ===');
    if (missing.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', `Missing required variables: ${missing.join(', ')}`);
    }
    if (invalid.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', `Invalid configurations:\n - ${invalid.join('\n - ')}`);
    }
    console.error('\x1b[31m%s\x1b[0m', 'Please check your server/.env file. Exiting server...');
    process.exit(1);
  }

  console.log('✓ Environment variables validated successfully.');
};

export default validateEnv;
