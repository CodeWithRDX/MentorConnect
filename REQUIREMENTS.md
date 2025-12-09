# Requirements to Run MentorConnect

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **MongoDB**: v6.0 or higher (local installation) OR MongoDB Atlas account (cloud)
- **Operating System**: macOS, Windows, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 500MB free space

### Recommended
- **Node.js**: v20.x LTS
- **MongoDB**: Latest stable version
- **Code Editor**: VS Code with extensions (ESLint, Prettier)

---

## 🔧 Installation Steps

### 1. Install Node.js

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows:**
- Download from: https://nodejs.org/
- Run the installer
- Verify installation: `node --version` and `npm --version`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install MongoDB

**Option A: Local MongoDB**

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Run the installer
- MongoDB will start as a Windows service

**Linux:**
```bash
# Follow official guide: https://www.mongodb.com/docs/manual/installation/
```

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Sign up at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string

### 3. Verify Installations

```bash
# Check Node.js version
node --version  # Should show v18.x or higher

# Check npm version
npm --version   # Should show v8.x or higher

# Check MongoDB (if installed locally)
mongod --version  # Should show MongoDB version
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `server/.env` file with the following:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/mentorconnect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mentorconnect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email Configuration (Nodemailer)
# For Gmail:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@mentorconnect.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (Optional)

Create `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Setup

### Step 1: Install Dependencies

From the project root directory:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

**OR use the convenience script:**
```bash
npm run install-all
```

### Step 2: Start MongoDB

**If using local MongoDB:**
```bash
# macOS/Linux
brew services start mongodb-community
# OR
mongod

# Windows
# MongoDB should start automatically as a service
```

**If using MongoDB Atlas:**
- No local setup needed
- Just use your connection string in `.env`

### Step 3: Seed Database (Optional)

Populate database with sample data:

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@mentorconnect.com` / `admin123`
- Sample mentors
- Sample mentee

### Step 4: Run the Application

**Option A: Run both frontend and backend together**
```bash
# From root directory
npm run dev
```

**Option B: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 🔐 Email Configuration (Optional but Recommended)

For email verification and password reset to work:

### Gmail Setup:
1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use this password in `EMAIL_PASS` in `.env`

### Other Email Providers:
- **Outlook**: Use `smtp-mail.outlook.com` port `587`
- **Yahoo**: Use `smtp.mail.yahoo.com` port `587`
- **Custom SMTP**: Update `EMAIL_HOST` and `EMAIL_PORT` accordingly

**Note**: Email functionality is optional. The app will work without it, but users won't be able to verify emails or reset passwords.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### MongoDB Connection Error
- Check if MongoDB is running: `mongod --version`
- Verify `MONGODB_URI` in `.env` is correct
- For Atlas: Check IP whitelist and credentials

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that backend is running on port 5000

---

## ✅ Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB installed or Atlas account created
- [ ] Dependencies installed (`npm run install-all`)
- [ ] `server/.env` file created with all variables
- [ ] MongoDB running (local) or Atlas connection string configured
- [ ] Database seeded (optional: `cd server && npm run seed`)
- [ ] Backend running (`cd server && npm run dev`)
- [ ] Frontend running (`cd client && npm run dev`)
- [ ] Application accessible at http://localhost:3000

---

## 📚 Additional Resources

- **Node.js Docs**: https://nodejs.org/docs/
- **MongoDB Docs**: https://docs.mongodb.com/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error message in the terminal
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check that ports 3000 and 5000 are available
5. Review the README.md for detailed setup instructions

