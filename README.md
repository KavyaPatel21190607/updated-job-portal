# Job Listing Portal with End-to-End Encryption

A full-stack job portal application with secure messaging, built using the MERN stack and featuring RSA-OAEP end-to-end encryption for private communications.

## 🚀 Features

### For Job Seekers
- 🔍 Advanced job search with filters (location, salary, experience, job type)
- 📝 Resume builder with downloadable PDF
- 📊 Application tracking dashboard
- 💬 Encrypted messaging with employers
- 👤 Profile management with resume upload
- 📈 Application status tracking (Pending, Viewed, Shortlisted, Interview, Hired, Rejected)

### For Employers
- 💼 Job posting management (Create, Edit, Delete)
- 👥 Applicant management and filtering
- 📅 Interview scheduling
- 💬 Encrypted messaging with candidates
- 🏢 Company profile management
- 📊 Hiring analytics dashboard

### Security Features
- 🔐 **End-to-End Encryption**: Messages encrypted with RSA-OAEP 2048-bit keys
- 🔒 Database admin cannot read messages (only encrypted gibberish stored)
- 🔑 Private keys never leave the browser (stored in localStorage)
- ✅ Dual-token JWT authentication (Access + Refresh tokens)
- 🔓 Google OAuth integration

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Hooks
- **Encryption**: Web Crypto API (RSA-OAEP)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Passport.js (Google OAuth)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)
- Git

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KavyaPatel21190607/updated-job-portal.git
cd updated-job-portal
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/job-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_REFRESH_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm start
```

Backend will run on **http://localhost:5000**

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Start the frontend development server:

```bash
npm run dev
```

Frontend will run on **http://localhost:5173**

## 🔐 Encryption System

### How Message Encryption Works

1. **Key Generation**: Each user gets a 2048-bit RSA key pair on first login
   - Private key: Stored in browser localStorage (never sent to server)
   - Public key: Stored in database (used by others to encrypt messages)

2. **Sending a Message**:
   - Message encrypted **twice**:
     - Once with sender's public key → `encryptedForSender`
     - Once with receiver's public key → `encryptedForReceiver`
   - Only encrypted versions stored in database (no plaintext!)

3. **Reading Messages**:
   - Sender decrypts `encryptedForSender` with their private key
   - Receiver decrypts `encryptedForReceiver` with their private key
   - Database admin sees only encrypted gibberish! 🔒

### Security Notes

⚠️ **Important**: If you clear browser localStorage, you'll lose your private key and won't be able to decrypt old messages. This is by design for maximum security.

## 📁 Project Structure

```
job-listing-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Database, passport config
│   │   └── server.js        # Entry point
│   ├── uploads/             # File storage
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── layouts/     # Layout wrappers
│   │   │   └── pages/       # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Encryption utilities
│   │   └── styles/          # Global styles
│   └── package.json
│
└── README.md
```

## 🧪 Testing the Application

### Test Accounts

**Employer Account:**
- Email: `kavyapatel1952007@gmail.com`
- Password: `admin123`

**Job Seeker Account:**
- Email: `nisargshah090706@gmail.com`
- Password: `jobseeker123`

### Testing Encryption

1. Login as Employer (Kavya Patel)
2. Open Messages and select a job seeker
3. Send a message
4. Login as Job Seeker (Nisarg Shah) in another browser/incognito
5. Check messages - you should see the decrypted message
6. Check MongoDB database - you'll see only encrypted content!

## 📦 Available Scripts

### Backend

```bash
npm start          # Start server with nodemon (development)
npm run prod       # Start server (production)
```

### Frontend

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/job/:jobId` - Get job applications (employer)
- `PUT /api/applications/:id/status` - Update application status

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get specific conversation
- `POST /api/messages` - Send encrypted message
- `PUT /api/users/public-key` - Update encryption public key
- `GET /api/users/:id/public-key` - Get user's public key

### Dashboard
- `GET /api/dashboard/employer` - Employer dashboard stats
- `GET /api/dashboard/job-seeker` - Job seeker dashboard stats

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check your MongoDB URI in `.env`
- Ensure IP whitelist includes your IP in MongoDB Atlas
- Verify network connectivity

**JWT Token Errors:**
- Clear browser localStorage and login again
- Check JWT secrets are set in `.env`

### Frontend Issues

**CORS Errors:**
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL
- Check backend is running on port 5000

**Encryption Errors:**
- Clear localStorage and refresh page
- Ensure both users have generated encryption keys
- Check browser console for detailed error messages

### Encryption Issues

**Can't decrypt messages:**
- Make sure you haven't cleared localStorage
- Ensure encryption keys were generated (check console logs)
- Verify public keys are stored in database

## 🚀 Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables
2. Use `npm run prod` as start command
3. Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to production backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- **Kavya Patel** - [@KavyaPatel21190607](https://github.com/KavyaPatel21190607)

## 🙏 Acknowledgments

- shadcn/ui for beautiful UI components
- Web Crypto API for encryption implementation
- MongoDB Atlas for database hosting
- Vite for blazing fast development experience

---

**⚡ Built with security and user experience in mind!**

For issues or questions, please open an issue on GitHub.
