const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// --- GET: Fetch all wishlist items for the logged-in user ---
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Join the wishlist table with items table to return full product details
    const query = `
      SELECT items.* 
      FROM wishlist 
      JOIN items ON wishlist.item_id = items.id 
      WHERE wishlist.user_id = $1
      ORDER BY wishlist.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});

// --- POST: Toggle (Add/Remove) an item in the wishlist ---
router.post('/toggle', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.body;

    if (!item_id) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    // Check if the item is already in the user's wishlist
    const checkQuery = `SELECT id FROM wishlist WHERE user_id = $1 AND item_id = $2`;
    const checkResult = await pool.query(checkQuery, [userId, item_id]);

    if (checkResult.rows.length > 0) {
      // It exists -> REMOVE IT (Unlike)
      await pool.query(`DELETE FROM wishlist WHERE user_id = $1 AND item_id = $2`, [userId, item_id]);
      return res.status(200).json({ isWishlisted: false, message: "Removed from wishlist" });
    } else {
      // It does NOT exist -> ADD IT (Like)
      await pool.query(`INSERT INTO wishlist (user_id, item_id) VALUES ($1, $2)`, [userId, item_id]);
      return res.status(200).json({ isWishlisted: true, message: "Added to wishlist" });
    }

  } catch (error) {
    console.error("Error toggling wishlist:", error);
    res.status(500).json({ message: "Failed to update wishlist" });
  }
});

module.exports = router;