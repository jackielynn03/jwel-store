const requireAdmin = (req, res, next) => {
  // Ensure the user object exists (from verifyToken) and the role is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = requireAdmin;