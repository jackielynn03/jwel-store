require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet'); 

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE (Must be at the top)
// ==========================================

// Secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Prevents blocking your own uploaded images
}));

// Dynamic CORS from Environment Variable
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendOrigin,
  credentials: true 
}));

// Body parsing and cookies
app.use(express.json());
app.use(cookieParser());


// ==========================================
// 2. MOUNT ROUTES
// ==========================================

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const itemRoutes = require('./routes/itemRoutes');
app.use('/api/items', itemRoutes);


// ==========================================
// 3. STATIC FILES & ERROR HANDLING
// ==========================================

// Make the uploads folder accessible to the browser
app.use('/uploads', express.static('uploads'));

// Global JSON Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);

  // Catch Multer file size limits gracefully
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Maximum size is 15MB.' });
  }

  // Generic fallback
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));