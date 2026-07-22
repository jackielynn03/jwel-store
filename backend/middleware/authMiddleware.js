const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extract token directly from HTTP-Only cookies
  const token = req.cookies?.accessToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized! No token provided in cookies.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    req.user = {
      ...decoded,
      id: String(decoded.id) 
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized! Access Token was expired or invalid' });
  }
};

module.exports = verifyToken;