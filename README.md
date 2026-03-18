# AI Clinic Pro - Backend API Server

A robust Node.js + Express.js REST API for healthcare clinic management system with MongoDB database, JWT authentication, appointment scheduling, prescription management, and AI-powered assistant.

**Live API:** https://hackathon-server-4c7a.onrender.com

---

## 📋 Project Overview

Backend server for AI Clinic Pro that handles all business logic, database operations, user authentication, appointment management, prescription generation, and AI interactions. Designed to work with React frontend (separate repository).

**Backend Features:**
- Multi-role user authentication (Admin, Doctor, Patient, Receptionist)
- JWT-based secure authentication
- OTP-based password reset (with demo & production modes)
- Appointment scheduling and management
- Digital prescription creation and PDF generation
- Patient records management
- AI-powered medical assistant responses
- Analytics data aggregation
- Role-based access control
- MongoDB database integration
- Email notifications (Nodemailer)
- Automatic OTP expiration
- User blocking/management

---

## 🏗️ Architecture

```
Express.js Server (Port: 5000)
        ↓
Middleware (Auth, CORS, Error Handling)
        ↓
Routes (7 modules)
        ↓
Controllers (Business Logic)
        ↓
Models (MongoDB Schemas)
        ↓
Utilities (Email, PDF, AI)
        ↓
Database (MongoDB)
```

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js                  # User schema (all roles)
│   │   ├── Patient.js               # Patient records
│   │   ├── Appointment.js           # Appointment scheduling
│   │   ├── Prescription.js          # Prescription data
│   │   └── DiagnosisLog.js          # AI diagnosis history
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── patientController.js     # Patient management
│   │   ├── appointmentController.js # Appointment operations
│   │   ├── prescriptionController.js# Prescription handling
│   │   ├── adminController.js       # Admin operations
│   │   ├── aiController.js          # AI assistant logic
│   │   └── analyticsController.js   # Analytics data
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── patientRoutes.js         # /api/patients/*
│   │   ├── appointmentRoutes.js     # /api/appointments/*
│   │   ├── prescriptionRoutes.js    # /api/prescriptions/*
│   │   ├── adminRoutes.js           # /api/admin/*
│   │   ├── aiRoutes.js              # /api/ai/*
│   │   └── analyticsRoutes.js       # /api/analytics/*
│   │
│   ├── middlewares/
│   │   └── authMiddleware.js        # JWT verification & role checking
│   │
│   ├── utils/
│   │   ├── emailHelper.js           # OTP email sending (Demo & Production)
│   │   ├── aiHelper.js              # AI response generation
│   │   ├── generatePDF.js           # PDF prescription generation
│   │
│   └── server.js                     # Express app setup
│
├── uploads/
│   └── prescriptions/               # Generated PDF storage
│
├── .env                              # Environment variables
├── package.json                      # Dependencies
└── README.md                          # This file
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | JavaScript runtime |
| Express.js | 4.x | Web framework |
| MongoDB | Cloud/Local | NoSQL database |
| Mongoose | 7.x | MongoDB ODM |
| JWT | jsonwebtoken | Authentication |
| bcryptjs | 2.x | Password hashing |
| Nodemailer | 6.x | Email sending |
| jsPDF | 2.x | PDF generation |
| CORS | Latest | Cross-origin requests |
| dotenv | Latest | Environment variables |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB (Cloud Atlas or Local)
- Gmail account (optional - for email OTP)
- Git

### Installation

```bash
# Clone the repository
git clone [your-backend-repo-url]
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration (see below)

# Start development server
npm start
```

Server will run on: `http://localhost:5000`

### Development Commands

```bash
npm start              # Start server
npm run dev            # Start with nodemon (hot reload)
npm run lint           # Check code quality
npm test               # Run tests (if configured)
```

---

## ⚙️ Environment Setup

Create a `.env` file in the backend root folder:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic

# JWT Authentication
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRE=30d

# Email Configuration (Optional - Demo Mode Works Without)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Configuration (Optional)
AI_API_KEY=your-api-key-if-using-external-ai
```

### Database Setup

#### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Replace with your credentials:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/clinic
   ```

#### Option 2: Local MongoDB
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string:
   ```
   mongodb://localhost:27017/clinic
   ```

### Gmail App Password Setup (Optional)

**Note:** Demo mode works without email! This is for production OTP emails.

1. Enable 2-Step Verification on Google Account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. Generate App Password
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail"
   - Select "Other (custom name)"
   - Choose your device
   - Google generates 16-character password

3. Add to `.env`
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

4. Restart server - OTP emails now work!

---

## 🔐 Authentication System

### JWT Token Flow

```
1. User registers/logs in
   ↓
2. Backend hashes password with bcrypt
   ↓
3. JWT token generated (30 days expiry)
   ↓
4. Token sent to frontend
   ↓
5. Frontend stores in localStorage/cookies
   ↓
6. Every request includes: Authorization: Bearer <token>
   ↓
7. Backend validates token with authMiddleware
   ↓
8. Route handler executes
```

### Password Reset OTP Flow

```
User clicks "Forgot Password"
   ↓
Enters email address
   ↓
Backend generates 6-digit OTP
   ↓
DEMO MODE (No Email Configured):
  └─ Logs to console: "📧 [DEMO MODE] OTP Code: 462849"
     Frontend says: "Check backend console for OTP"
   
PRODUCTION MODE (Email Configured):
  └─ Sends OTP via Gmail SMTP
     User receives in email
   ↓
User enters OTP on frontend
   ↓
Backend validates OTP (expires in 10 minutes)
   ↓
User sets new password
   ↓
Backend hashes new password & updates DB
   ↓
OTP deleted from database
   ↓
User can login with new password
```

---

## 📡 API Endpoints

### Base URL
```
https://hackathon-server-4c7a.onrender.com/api
```

Or locally:
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "patient"           // patient, doctor, receptionist, admin
}

Response: { token, user: {...} }
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response: { token, user: {...} }
```

#### Forgot Password (Request OTP)
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: { message: "OTP sent to email / Check backend console" }
```

#### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "462849",
  "newPassword": "NewPassword123!"
}

Response: { message: "Password reset successfully" }
```

#### Get User Profile
```
GET /auth/profile
Authorization: Bearer <token>

Response: { user: {...} }
```

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "specialization": "Cardiology"    // for doctors
}

Response: { user: {...} }
```

#### Get All Doctors
```
GET /auth/doctors
Authorization: Bearer <token>

Response: { doctors: [...] }
```

### Appointment Endpoints

#### Create Appointment
```
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "507f1f77bcf86cd799439011",
  "patientId": "507f1f77bcf86cd799439012",
  "date": "2026-03-25",
  "time": "10:00 AM",
  "reason": "General checkup"
}

Response: { appointment: {...} }
```

#### Get Appointments
```
GET /appointments
Authorization: Bearer <token>

Response: { appointments: [...] }
```

#### Update Appointment Status
```
PUT /appointments/:appointmentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"    // pending, confirmed, completed, cancelled
}

Response: { appointment: {...} }
```

#### Cancel Appointment
```
DELETE /appointments/:appointmentId
Authorization: Bearer <token>

Response: { message: "Appointment cancelled" }
```

### Prescription Endpoints

#### Create Prescription
```
POST /prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439012",
  "medicines": [
    {
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days"
    }
  ],
  "instructions": "Take with food"
}

Response: { prescription: {...}, pdfUrl: "..." }
```

#### Get Prescriptions
```
GET /prescriptions
Authorization: Bearer <token>

Response: { prescriptions: [...] }
```

#### Download Prescription PDF
```
GET /prescriptions/:prescriptionId/pdf
Authorization: Bearer <token>

Response: PDF file download
```

### Patient Endpoints

#### Get All Patients
```
GET /patients
Authorization: Bearer <token>

Response: { patients: [...] }
```

#### Get Patient Details
```
GET /patients/:patientId
Authorization: Bearer <token>

Response: { patient: {...} }
```

#### Update Patient
```
PUT /patients/:patientId
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodType": "O+",
  "allergies": "Penicillin",
  "medicalHistory": "Diabetes"
}

Response: { patient: {...} }
```

### AI Assistant Endpoints

#### Get AI Response
```
POST /ai/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What are the symptoms of flu?"
}

Response: { 
  response: "Flu symptoms include...",
  disclaimer: "This is not medical advice..."
}
```

### Admin Endpoints

#### Get All Users
```
GET /admin/users
Authorization: Bearer <token>
Role Required: admin

Response: { users: [...] }
```

#### Block User
```
PUT /admin/users/:userId/block
Authorization: Bearer <token>
Role Required: admin

Response: { user: {...} }
```

#### Unblock User
```
PUT /admin/users/:userId/unblock
Authorization: Bearer <token>
Role Required: admin

Response: { user: {...} }
```

#### Delete User
```
DELETE /admin/users/:userId
Authorization: Bearer <token>
Role Required: admin

Response: { message: "User deleted" }
```

### Analytics Endpoints

#### Get Analytics Data
```
GET /analytics
Authorization: Bearer <token>

Response: {
  totalUsers: 150,
  totalAppointments: 342,
  totalPrescriptions: 89,
  usersByRole: {...},
  appointmentsTrend: [...],
  ...
}
```

---

## 📦 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,              // admin, doctor, patient, receptionist
  specialization: String,    // for doctors
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  age: Number,
  gender: String,
  bloodType: String,
  allergies: [String],
  medicalHistory: String,
  phoneNumber: String,
  address: String,
  emergencyContact: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model
```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: User),
  patientId: ObjectId (ref: User),
  date: Date,
  time: String,
  reason: String,
  status: String,            // pending, confirmed, completed, cancelled
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Prescription Model
```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: User),
  patientId: ObjectId (ref: User),
  medicines: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }
  ],
  instructions: String,
  diagnosis: String,
  pdfUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### DiagnosisLog Model
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: User),
  question: String,
  response: String,
  timestamp: Date
}
```

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcryptjs with salt rounds  
✅ **Role-Based Access Control** - Admin-only endpoints protected  
✅ **OTP Security** - 6-digit codes, 10-minute expiration  
✅ **CORS Configuration** - Frontend-only access  
✅ **Input Validation** - All inputs sanitized  
✅ **Error Handling** - No sensitive data in error messages  
✅ **Environment Variables** - Secrets not hardcoded  
✅ **Protected Routes** - authMiddleware on sensitive endpoints  
✅ **User Blocking** - Admin can block user accounts  

---

## 🧪 Testing the API

### Using Postman/Thunder Client

1. **Register User**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "name": "Test Patient",
       "email": "patient@test.com",
       "password": "TestPass123!",
       "role": "patient"
     }
     ```
   - Copy the token from response

2. **Use Token for Protected Requests**
   - Add header: `Authorization: Bearer <token>`
   - Example: Get Profile
     ```
     GET http://localhost:5000/api/auth/profile
     ```

3. **Test Forgot Password**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/forgot-password`
   - Body: `{ "email": "patient@test.com" }`
   - Check backend console for OTP (Demo Mode)
   - Or check email (Production Mode)

### Test Accounts (If Seeded)

```
Admin:
email: admin@clinic.com
password: admin123

Doctor:
email: doctor@clinic.com
password: doctor123

Patient:
email: patient@clinic.com
password: patient123

Receptionist:
email: receptionist@clinic.com
password: receptionist123
```

---

## 🚀 Deployment

### Deploy to Render

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add all from .env
6. Deploy!

**Current Deployment:** https://hackathon-server-4c7a.onrender.com

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add environment variables
heroku config:set MONGODB_URI=your-connection-string
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Deploy to Railway/Vercel

- Similar process with environment variable configuration
- Add MongoDB connection string
- Add JWT secret and email credentials

---

## 📊 Demo Mode vs Production Mode

### Demo Mode (Default - No Email Setup)

**When:** EMAIL_USER and EMAIL_PASS not configured

**OTP Output:**
```
Backend Console:
📧 [DEMO MODE] Password Reset OTP
Email: user@example.com
OTP Code: 462849
Expires in: 10 minutes
```

**Frontend Shows:** "Check backend console for OTP"

**Use Case:** Development, testing, quick demonstrations

### Production Mode (Email Configured)

**When:** EMAIL_USER and EMAIL_PASS added to .env

**OTP Output:**
```
User receives email with OTP code
Frontend shows generic "OTP sent" message
```

**Use Case:** Real deployments, actual user emails

**Switch anytime:** Just add/remove email variables, restart server!

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Check MONGODB_URI in .env
- Verify MongoDB is running (if local)
- Check IP whitelist on MongoDB Atlas (if cloud)

### "JWT secret not found"
- Add JWT_SECRET to .env
- Make sure it's at least 32 characters
- Restart server

### "OTP not sending emails"
- Check if EMAIL_USER and EMAIL_PASS are configured
- Verify Gmail account has 2-Step Verification enabled
- Confirm using App Password (not regular password)
- Check spam folder
- Or use Demo Mode for testing

### "CORS error from frontend"
- Verify FRONTEND_URL in .env matches frontend URL
- Check frontend Origin header
- Restart backend server

### "User password reset not working"
- Verify OTP is correct (demo mode: check console)
- Confirm OTP hadn't expired (10 minutes)
- Check user email exists in database

### "Port 5000 already in use"
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

---

## 📚 API Documentation

Complete API docs with live testing available at:
`https://hackathon-server-4c7a.onrender.com/api-docs` (if Swagger enabled)

---

## 🔄 Related Repositories

**Frontend Repository:** (Separate GitHub repo)
- React + Vite SPA
- Consumes this API
- Deployed on Vercel/Netlify

---

## 📞 Support & Contacts

API Status: https://hackathon-server-4c7a.onrender.com  
GitHub: [Your reposit]  
Issues: [Report on GitHub]  

---

## 📝 License

This project is open source and available under the MIT License.

---

## ✨ Features Checklist

- [x] User authentication & registration
- [x] Role-based access control
- [x] JWT token management
- [x] OTP-based password reset (Demo + Production modes)
- [x] Appointment scheduling
- [x] Prescription management
- [x] PDF generation
- [x] Patient records
- [x] AI assistant integration
- [x] Analytics data aggregation
- [x] Error handling
- [x] CORS configuration
- [x] MongoDB integration
- [x] Email notifications
- [x] Deployed & live

---

**Backend Ready for Production! 🚀**
