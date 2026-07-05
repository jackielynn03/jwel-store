const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Explicitly cast ID to string as requested
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