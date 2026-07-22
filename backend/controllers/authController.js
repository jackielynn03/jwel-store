const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const logger = require('../utils/logger'); // Integrated Structured Logger

// --- REGISTER ---
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email, role',
      [username, email, passwordHash]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: String(user.user_id), role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

    // Set Access Token Cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 // 15 Minutes
    });

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      user: { id: user.user_id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// --- REFRESH TOKEN ---
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: String(decoded.id), role: decoded.role }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );

    // Issue new Access Token Cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 
    });

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    logger.error('Refresh token error', { error: error.message });
    return res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
  }
};

// --- GET PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const userResult = await pool.query(
      // FIX: Added 'role' to the SELECT statement so the frontend recognizes admins on refresh
      'SELECT username, email, full_name, address, role FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email, address } = req.body;
    const userId = req.user.id;

    if (email) {
      const emailCheck = await pool.query(
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2', 
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already in use by another account.' });
      }
    }

    const updateQuery = `
      UPDATE users 
      SET full_name = $1, email = $2, address = $3 
      WHERE user_id = $4 
      -- FIX: Added 'role' to RETURNING so frontend state stays intact after profile updates
      RETURNING username, email, full_name, address, role 
    `;
    
    const updatedUser = await pool.query(updateQuery, [full_name, email, address, userId]);
    
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// --- LOGOUT ---
exports.logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  };
  
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  
  res.status(200).json({ message: 'Logged out successfully' });
};