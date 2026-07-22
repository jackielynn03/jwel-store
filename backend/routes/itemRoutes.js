const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const verifyToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateMiddleware');
const { itemSchema } = require('../validators/schemas');
const upload = require('../middleware/uploadMiddleware');
const pool = require('../db');
const axios = require('axios');

// --- RATE LIMITER: General API Protection ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: 'Too many requests from this IP, please try again later' }
});

router.use(apiLimiter);

const cpUpload = upload.fields([
  { name: 'main_image', maxCount: 1 }, 
  { name: 'additional_images', maxCount: 10 }
]);

const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.join(__dirname, '..', filePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete old image ${absolutePath}:`, err);
    }
  });
};

// --- SECURE SERVER-SIDE CHECKOUT ---
router.post('/checkout', async (req, res, next) => {
  try {
    let userId = null;
    if (req.cookies && req.cookies.accessToken) {
      try {
        const decoded = require('jsonwebtoken').verify(req.cookies.accessToken, process.env.JWT_ACCESS_SECRET);
        userId = decoded.id ? Number(decoded.id) : null; 
      } catch (e) {}
    }

    const { items, fullName, email, phone, address } = req.body;
    
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const formattedItems = [];
    
    for (const item of items) {
      const dbItemRes = await pool.query('SELECT title, category, price FROM items WHERE id = $1', [item.id]);
      if (dbItemRes.rows.length === 0) continue; 
      
      const dbItem = dbItemRes.rows[0];
      formattedItems.push({
        id: item.id, name: dbItem.title, category: dbItem.category,
        size: item.size || 'N/A', type: item.type || 'N/A', color: item.color || 'N/A',
        price: dbItem.price 
      });
    }

    const orderData = { fullName, phone, address, email, items: formattedItems };

    try {
      const insertOrderQuery = `
        INSERT INTO orders (user_id, customer_name, phone, address, email, items) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await pool.query(insertOrderQuery, [
        userId, fullName, phone, address, email, JSON.stringify(formattedItems)
      ]);
    } catch (dbError) {
      console.error('Failed to save order to PostgreSQL:', dbError);
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
    if (GOOGLE_SCRIPT_URL) {
      try {
        await axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(orderData), {
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
      } catch (googleError) {}
    }

    res.status(200).json({ message: 'Order processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process order' });
  }
});

// --- 1. POST: CREATE ITEM ---
router.post('/', verifyToken, requireAdmin, cpUpload, validate(itemSchema), async (req, res, next) => {
  try {
    const { category, title, description, price, type, color, size } = req.body;
    const attributes = { type, color, size };
    const mainImagePath = req.files['main_image'] ? `/uploads/${req.files['main_image'][0].filename}` : null;
    const additionalImagePaths = req.files['additional_images'] 
      ? req.files['additional_images'].map(file => `/uploads/${file.filename}`) : [];

    const query = `
      INSERT INTO items (category, title, description, price, main_image, additional_images, attributes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    const values = [category, title, description, price, mainImagePath, additionalImagePaths, attributes];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Item created successfully', data: result.rows[0] });
  } catch (error) { next(error); }
});

// --- 2. GET: FETCH ALL ITEMS (WITH PAGINATION) ---
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const categoryFilter = req.query.category;

    let query = `SELECT * FROM items`;
    let countQuery = `SELECT COUNT(*) FROM items`;
    let params = []; let countParams = [];

    if (categoryFilter) {
      query += ` WHERE category = $1`;
      countQuery += ` WHERE category = $1`;
      params.push(categoryFilter); countParams.push(categoryFilter);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const itemsRes = await pool.query(query, params);
    const countRes = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countRes.rows[0].count);

    res.status(200).json({
      data: itemsRes.rows,
      pagination: { totalItems, currentPage: page, totalPages: Math.ceil(totalItems / limit), itemsPerPage: limit }
    });
  } catch (error) { next(error); }
});

// --- 3. GET: FETCH ORDER HISTORY FOR LOGGED-IN USER ---
router.get('/my-orders', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = `SELECT id, status, created_at, items FROM orders WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

// --- NEW: GET ALL ORDERS FOR ADMIN ---
router.get('/admin/orders', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const query = `SELECT * FROM orders ORDER BY created_at DESC`;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

// --- NEW: PUT UPDATE ORDER STATUS FOR ADMIN ---
router.put('/admin/orders/:id/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Ensure the status matches your requested categories
    if (!['Pending', 'Canceled', 'Successed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const query = `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Status updated successfully', data: result.rows[0] });
  } catch (error) { next(error); }
});

// --- 4. GET: FETCH SINGLE ITEM ---
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM items WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

// --- 5. PUT: UPDATE ITEM ---
router.put('/:id', verifyToken, requireAdmin, cpUpload, validate(itemSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, title, description, price, type, color, size } = req.body;
    const attributes = { type, color, size };

    const oldItemRes = await pool.query(`SELECT main_image, additional_images FROM items WHERE id = $1`, [id]);
    if (oldItemRes.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    const oldItem = oldItemRes.rows[0];

    let newMainImagePath = oldItem.main_image;
    if (req.files && req.files['main_image']) {
      newMainImagePath = `/uploads/${req.files['main_image'][0].filename}`;
      deleteFile(oldItem.main_image); 
    }

    let newAdditionalImagePaths = oldItem.additional_images;
    if (req.files && req.files['additional_images']) {
      newAdditionalImagePaths = req.files['additional_images'].map(file => `/uploads/${file.filename}`);
      if (oldItem.additional_images) oldItem.additional_images.forEach(deleteFile); 
    }

    const query = `
      UPDATE items 
      SET category=$1, title=$2, description=$3, price=$4, main_image=$5, additional_images=$6, attributes=$7, updated_at=CURRENT_TIMESTAMP 
      WHERE id=$8 RETURNING *;
    `;
    const values = [category, title, description, price, newMainImagePath, newAdditionalImagePaths, attributes, id];
    
    const result = await pool.query(query, values);
    res.status(200).json({ message: 'Item updated successfully', data: result.rows[0] });
  } catch (error) { next(error); }
});

// --- 6. DELETE: REMOVE ITEM ---
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM items WHERE id = $1 RETURNING main_image, additional_images`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

    deleteFile(result.rows[0].main_image);
    if (result.rows[0].additional_images) result.rows[0].additional_images.forEach(deleteFile);

    res.status(200).json({ message: 'Item and associated images deleted successfully' });
  } catch (error) { next(error); }
});

module.exports = router;