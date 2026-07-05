require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Adjust if your React port is different
  credentials: true 
}));

// Routes
const authRoutes = require('./routes/authRoutes');

// Mount routes
app.use('/api/auth', authRoutes);

const itemRoutes = require('./routes/itemRoutes');

// Mount item routes
app.use('/api/items', itemRoutes);

// Make the uploads folder accessible to the browser
app.use('/uploads', express.static('uploads'));

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

// 2. Use Helmet to secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Prevents blocking your own images
}));

app.use(express.json());
app.use(cookieParser());

// 3. Dynamic CORS from Environment Variable
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendOrigin,
  credentials: true 
}));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));