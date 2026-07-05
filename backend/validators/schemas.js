const { z } = require('zod');

exports.registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

exports.loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

exports.updateProfileSchema = z.object({
  full_name: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  address: z.string().max(255).optional().nullable()
});

// Since items use FormData (Multipart), all incoming text fields are strings
exports.itemSchema = z.object({
  category: z.enum(['Vòng Tay', 'Nhẫn', 'Set', 'Collection', 'Bộ trà & Rượu']),
  title: z.string().min(1, "Title is required"),
  type: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  // Ensure price is a valid numeric string before it hits PostgreSQL
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format") 
});