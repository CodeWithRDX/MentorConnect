# MentorConnect - Virtual Mentorship Platform

A full-stack virtual mentorship platform connecting mentors and mentees for professional growth and development.

## 🚀 Features

### Authentication
- User registration (Mentor/Mentee selection)
- Login/Logout with JWT tokens (httpOnly cookies)
- Email verification
- Forgot/Reset password functionality

### Mentor Management
- Mentor application system
- Admin approval workflow
- Mentor profile with skills, experience, and bio
- Rating and review system
- Availability calendar
- Booking management

### Mentee Features
- Search mentors by category, skill, and rating
- Detailed mentor profile pages
- Session booking system
- Payment integration placeholder
- Favorite mentors

### Dashboards
- **Mentor Dashboard**: View bookings, manage availability, edit profile
- **Mentee Dashboard**: View booked sessions, favorite mentors, profile settings
- **Admin Dashboard**: Approve mentors, manage users, view statistics

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- TailwindCSS
- ShadCN UI components
- Framer Motion animations
- Axios
- Context API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication (httpOnly cookies)
- bcrypt password hashing
- Role-based access control (Mentor/Mentee/Admin)
- Multer (file uploads)
- Nodemailer (email verification + password reset)

## 📁 Project Structure

```
MentorConnect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/        # React Context providers
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/
│   └── package.json
│
├── server/                 # Backend Express application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MentorConnect
   ```

2. **Install dependencies**
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

3. **Environment Setup**

   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mentorconnect
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7

   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@mentorconnect.com

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

   Create a `.env` file in the `client` directory (optional):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**

   From the root directory:
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Mentors
- `GET /api/mentors` - Get all approved mentors (with filters)
- `GET /api/mentors/:id` - Get single mentor
- `POST /api/mentors/apply` - Apply to become mentor
- `PUT /api/mentors/:id` - Update mentor profile
- `GET /api/mentors/category/:category` - Get mentors by category

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:id` - Get user bookings
- `GET /api/bookings/mentor/:id` - Get mentor bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/complete` - Complete booking with review

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/mentor/approve/:id` - Approve mentor
- `DELETE /api/admin/user/:id` - Delete user
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/stats` - Get dashboard statistics

## 🎨 Design System

The application uses TailwindCSS with a custom design system. Colors, typography, and spacing can be customized in `client/tailwind.config.js`.

**Note**: For pixel-perfect implementation, update the Tailwind config with exact values from your Figma design:
- Colors (primary, secondary, accent, etc.)
- Typography (font families, sizes, line heights)
- Spacing scale
- Border radius
- Shadows

## 🔐 User Roles

1. **Mentee**: Default role, can search and book mentors
2. **Mentor**: Can apply to become a mentor (requires admin approval)
3. **Admin**: Can approve mentors, manage users, and view statistics

## 📧 Email Configuration

For email functionality (verification and password reset), configure Nodemailer in the `.env` file. For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## 🧪 Testing

To test the application:

1. **Create a test admin user** (manually in MongoDB or via API):
   ```javascript
   // In MongoDB shell or via API
   {
     name: "Admin User",
     email: "admin@test.com",
     password: "hashed_password",
     role: "admin",
     isEmailVerified: true
   }
   ```

2. **Register as a mentee** and explore the platform
3. **Register as a mentor** and submit an application
4. **Approve the mentor** from the admin dashboard
5. **Book a session** as a mentee

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd client && npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set environment variables in your hosting platform

### Backend (Heroku/Railway/DigitalOcean)
1. Set all environment variables
2. Ensure MongoDB connection string is set
3. Deploy the server folder
4. Update `FRONTEND_URL` in backend `.env`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@mentorconnect.com or create an issue in the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**

