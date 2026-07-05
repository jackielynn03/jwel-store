const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/schemas');

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
  message: { message: 'Too many accounts created from this IP, please try again later' }
});

// Public Routes (Protected by Limits & Validation)
router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout); // NEW LOGOUT ROUTE

// Protected Routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;