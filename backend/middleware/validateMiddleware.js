const validate = (schema) => (req, res, next) => {
  try {
    // Validate and strip out any unexpected fields sent by malicious users
    const validData = schema.parse(req.body);
    req.body = validData; 
    next();
  } catch (err) {
    // Format Zod errors nicely
    const errors = err.errors.map(e => ({ field: e.path[0], message: e.message }));
    return res.status(400).json({ message: 'Validation Error', errors });
  }
};

module.exports = validate;