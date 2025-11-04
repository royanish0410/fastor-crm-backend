# 🏢 CRM Backend System

> A REST API for managing student enquiries with JWT authentication. Counselors can view and claim leads.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- 🔐 JWT-based employee authentication
- 📝 Public enquiry form (no auth required)
- 👀 View all unclaimed enquiries
- ✋ Claim enquiries (converts public → private)
- 📊 Track personal claimed enquiries
- 🔒 Bcrypt password encryption

---

## 🛠 Tech Stack

- **Node.js** + **Express.js** - Backend framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

---

## 🚀 Installation

### Quick Setup

```bash
# 1. Create project
mkdir crm-backend && cd crm-backend

# 2. Initialize and install dependencies
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors express-validator
npm install --save-dev nodemon

# 3. Create folders
mkdir config controllers middleware models routes

# 4. Create files
touch server.js .env .gitignore
```

### Environment Setup

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_system
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### Update package.json

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Run Application

```bash
# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Start server
npm run dev
```

Server runs at `http://localhost:5000`

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000`

---

## 🔐 Authentication

### 1. Register Employee
```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUz..."
  }
}
```

---

### 2. Login Employee
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register (returns token)

---

### 3. Get My Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 📝 Enquiries

### 1. Submit Enquiry (Public - No Auth)
```http
POST /api/enquiries/submit
```

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "courseInterest": "Web Development",
  "message": "Interested in MERN stack"
}
```

**What you get:** Enquiry created with `status: "public"`, visible to all counselors

---

### 2. Get Unclaimed Enquiries
```http
GET /api/enquiries/unclaimed
Authorization: Bearer <token>
```

**Returns:** All enquiries with `status: "public"`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "courseInterest": "Web Development",
      "status": "public"
    }
  ]
}
```

---

### 3. Claim Enquiry
```http
PUT /api/enquiries/claim/:id
Authorization: Bearer <token>
```

**What happens:**
- Status changes to `"claimed"`
- `claimedBy` set to your employee ID
- Enquiry becomes invisible to other counselors
- Only you can see it in "My Claims"

---

### 4. Get My Claimed Enquiries
```http
GET /api/enquiries/my-claims
Authorization: Bearer <token>
```

**Returns:** Only enquiries you've claimed

---

### 5. Get All Enquiries
```http
GET /api/enquiries
Authorization: Bearer <token>
```

**Returns:** All enquiries (public + claimed) - for admin/testing

---

## 📊 Quick Reference Table

| Endpoint | Method | Auth | What It Does |
|----------|--------|------|--------------|
| `/api/auth/register` | POST | ❌ | Create counselor account |
| `/api/auth/login` | POST | ❌ | Get JWT token |
| `/api/auth/me` | GET | ✅ | Get your profile |
| `/api/enquiries/submit` | POST | ❌ | Submit student enquiry |
| `/api/enquiries/unclaimed` | GET | ✅ | See all public enquiries |
| `/api/enquiries/claim/:id` | PUT | ✅ | Claim an enquiry |
| `/api/enquiries/my-claims` | GET | ✅ | See your claimed enquiries |
| `/api/enquiries` | GET | ✅ | See all enquiries |

---

## 🧪 Testing Guide

### Complete Test Flow

```bash
# 1. Register Counselor 1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Counselor 1","email":"c1@test.com","password":"test123"}'
# Save token as TOKEN_1

# 2. Submit Enquiry (No Auth)
curl -X POST http://localhost:5000/api/enquiries/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Student A","email":"student@test.com","phone":"1234567890","courseInterest":"Web Dev"}'
# Save enquiry _id as ENQUIRY_ID

# 3. View Unclaimed
curl -X GET http://localhost:5000/api/enquiries/unclaimed \
  -H "Authorization: Bearer TOKEN_1"
# Should see the enquiry

# 4. Claim Enquiry
curl -X PUT http://localhost:5000/api/enquiries/claim/ENQUIRY_ID \
  -H "Authorization: Bearer TOKEN_1"
# Status changes to "claimed"

# 5. View My Claims
curl -X GET http://localhost:5000/api/enquiries/my-claims \
  -H "Authorization: Bearer TOKEN_1"
# Should see claimed enquiry

# 6. Register Counselor 2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Counselor 2","email":"c2@test.com","password":"test123"}'
# Save token as TOKEN_2

# 7. Counselor 2 View Unclaimed
curl -X GET http://localhost:5000/api/enquiries/unclaimed \
  -H "Authorization: Bearer TOKEN_2"
# Should NOT see Counselor 1's claimed enquiry
```

---

## 🎯 Business Logic

### Enquiry Lifecycle
```
1. Student submits → status: "public" → visible to ALL counselors
2. Counselor claims → status: "claimed" → visible to ONLY that counselor
3. Other counselors → Cannot see claimed enquiries anymore
```

### Key Rules
- **Public enquiries** = Visible to all counselors
- **Claimed enquiries** = Private to claiming counselor
- **One claim only** = Cannot claim already claimed enquiry
- **JWT required** = All counselor actions need authentication

---

## 📁 Project Structure

```
crm-backend/
├── config/
│   └── database.js           # MongoDB connection
├── controllers/
│   ├── authController.js     # Register, login, getMe
│   └── enquiryController.js  # Submit, claim, fetch enquiries
├── middleware/
│   └── auth.js               # JWT verification
├── models/
│   ├── Employee.js           # Counselor schema
│   └── Enquiry.js            # Enquiry schema
├── routes/
│   ├── authRoutes.js
│   └── enquiryRoutes.js
├── .env                      # Environment variables
├── server.js                 # Main entry point
└── package.json
```

---

## 📊 Database Schema

### Employee
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String, // "counselor" or "admin"
  createdAt: Date
}
```

### Enquiry
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  courseInterest: String,
  message: String,
  status: String, // "public" or "claimed"
  claimedBy: ObjectId, // Employee ref
  claimedAt: Date,
  createdAt: Date
}
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Missing/invalid token | Add `Authorization: Bearer <token>` header |
| `400 Email exists` | Duplicate registration | Use different email or login |
| `400 Already claimed` | Enquiry already claimed | Choose different enquiry |
| `ECONNREFUSED` | MongoDB not running | Start MongoDB: `sudo systemctl start mongod` |
| `EADDRINUSE` | Port in use | Change PORT in .env or kill process |

---

## 🔧 Troubleshooting

### MongoDB not connecting?
```bash
# Check if running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Test connection
mongosh
```

### Port already in use?
```bash
# Find process
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change port in .env
PORT=3000
```

### Token not working?
- Check format: `Authorization: Bearer <token>`
- Token expires after 7 days - login again
- Ensure no extra spaces in header

---

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration (7 days)
- ✅ Password field excluded from API responses
- ✅ Email validation
- ✅ CORS enabled
- ✅ Environment variables for secrets

---

## 🚀 Quick Start Commands

```bash
# Install everything
npm install

# Start development server
npm run dev

# Check if server is running
curl http://localhost:5000/

# Register and get token
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

---

## 📝 Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🎓 Requirements Checklist

- ✅ NodeJS Backend
- ✅ Express Framework  
- ✅ MongoDB Database
- ✅ JWT Authentication
- ✅ Employee Login/Register API
- ✅ Public Enquiry Form (No Auth)
- ✅ Claim Leads API
- ✅ Fetch Unclaimed Leads API
- ✅ Fetch My Claimed Leads API

---

## 📚 Integration Example

```javascript
// Login and get token
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@test.com', password: 'test123' })
});
const { data } = await response.json();
const token = data.token;

// Fetch unclaimed enquiries
const enquiries = await fetch('http://localhost:5000/api/enquiries/unclaimed', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Claim enquiry
await fetch(`http://localhost:5000/api/enquiries/claim/${enquiryId}`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🎯 Key Takeaways

1. **Public Enquiry Form** - Anyone can submit, no auth needed
2. **Unclaimed = Public** - All counselors see them
3. **Claim = Private** - Only you see your claimed enquiries
4. **JWT Token** - Required for all counselor operations
5. **One Claim Rule** - Can't claim already claimed enquiries

---

## 📞 Support

- Check MongoDB is running
- Verify .env variables are correct
- Ensure token format: `Bearer <token>`
- Test with cURL commands provided

---

**Created for Fastor NodeJS Developer Final Round**

**Happy Coding! 🚀**