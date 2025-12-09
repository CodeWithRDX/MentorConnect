# 🚀 Quick Start Guide

## Prerequisites Check

```bash
# Check Node.js (need v18+)
node --version

# Check npm
npm --version

# Check MongoDB (if installed locally)
mongod --version
```

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment
```bash
# Copy and edit server/.env.example to server/.env
# Add your MongoDB URI and other configs
```

### 3. Start MongoDB
```bash
# Local MongoDB
brew services start mongodb-community  # macOS
# OR use MongoDB Atlas (cloud)
```

### 4. Seed Database (Optional)
```bash
cd server && npm run seed
```

### 5. Run Application
```bash
# From root directory
npm run dev
```

### 6. Open Browser
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Test Credentials (after seeding)

- **Admin**: admin@mentorconnect.com / admin123
- **Mentor**: john@example.com / admin123
- **Mentee**: emily@example.com / admin123

## That's it! 🎉
