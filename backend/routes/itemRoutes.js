const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateMiddleware');
const { itemSchema } = require('../validators/schemas');
const upload = require('../middleware/uploadMiddleware');
const pool = require('../db');

const cpUpload = upload.fields([
  { name: 'main_image', maxCount: 1 }, 
  { name: 'additional_images', maxCount: 10 }
]);

// Helper function to delete files from the disk
const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.join(__dirname, '..', filePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete old image ${absolutePath}:`, err);
    }
  });
};

// --- 1. POST: CREATE ITEM ---
router.post('/', verifyToken, requireAdmin, cpUpload, validate(itemSchema), async (req, res, next) => {
  try {
    const { category, title, description, price, type, color, size } = req.body;
    
    // Bundle category-specific properties into a JSONB object
    const attributes = { type, color, size };
    
    const mainImagePath = req.files['main_image'] ? `/uploads/${req.files['main_image'][0].filename}` : null;
    const additionalImagePaths = req.files['additional_images'] 
      ? req.files['additional_images'].map(file => `/uploads/${file.filename}`) 
      : [];

    const query = `
      INSERT INTO items (category, title, description, price, main_image, additional_images, attributes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *;
    `;
    const values = [category, title, description, price, mainImagePath, additionalImagePaths, attributes];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Item created successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// --- 2. GET: FETCH ALL ITEMS (WITH PAGINATION) ---
router.get('/', async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const categoryFilter = req.query.category;

    let query = `SELECT * FROM items`;
    let countQuery = `SELECT COUNT(*) FROM items`;
    let params = [];
    let countParams = [];

    // Optional Category Filtering
    if (categoryFilter) {
      query += ` WHERE category = $1`;
      countQuery += ` WHERE category = $1`;
      params.push(categoryFilter);
      countParams.push(categoryFilter);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const itemsRes = await pool.query(query, params);
    const countRes = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countRes.rows[0].count);

    res.status(200).json({
      data: itemsRes.rows,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// --- 3. GET: FETCH SINGLE ITEM ---
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM items WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// --- 4. PUT: UPDATE ITEM (WITH OLD IMAGE CLEANUP) ---
router.put('/:id', verifyToken, requireAdmin, cpUpload, validate(itemSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, title, description, price, type, color, size } = req.body;
    const attributes = { type, color, size };

    // Fetch the existing item to get the old image paths
    const oldItemRes = await pool.query(`SELECT main_image, additional_images FROM items WHERE id = $1`, [id]);
    if (oldItemRes.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    const oldItem = oldItemRes.rows[0];

    // Handle Main Image replacement
    let newMainImagePath = oldItem.main_image;
    if (req.files && req.files['main_image']) {
      newMainImagePath = `/uploads/${req.files['main_image'][0].filename}`;
      deleteFile(oldItem.main_image); // Delete old main image from disk
    }

    // Handle Additional Images replacement (Assuming full replace if new ones are uploaded)
    let newAdditionalImagePaths = oldItem.additional_images;
    if (req.files && req.files['additional_images']) {
      newAdditionalImagePaths = req.files['additional_images'].map(file => `/uploads/${file.filename}`);
      if (oldItem.additional_images) oldItem.additional_images.forEach(deleteFile); // Delete old additional images
    }

    const query = `
      UPDATE items 
      SET category=$1, title=$2, description=$3, price=$4, main_image=$5, additional_images=$6, attributes=$7, updated_at=CURRENT_TIMESTAMP 
      WHERE id=$8 
      RETURNING *;
    `;
    const values = [category, title, description, price, newMainImagePath, newAdditionalImagePaths, attributes, id];
    
    const result = await pool.query(query, values);
    res.status(200).json({ message: 'Item updated successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// --- 5. DELETE: REMOVE ITEM ---
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM items WHERE id = $1 RETURNING main_image, additional_images`, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

    // Clean up files from the server
    deleteFile(result.rows[0].main_image);
    if (result.rows[0].additional_images) result.rows[0].additional_images.forEach(deleteFile);

    res.status(200).json({ message: 'Item and associated images deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;