const express = require("express");
const pool = require("../db"); // DB bağlantısı
const router = express.Router();

// Post ekleme
router.post("/", async (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id || !content) return res.status(400).json({ message: "Eksik bilgi" });

  try {
    const result = await pool.query(
      "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id, user_id, content, created_at",
      [user_id, content]
    );
    res.json({ message: "Post eklendi", post: result.rows[0] });
  } catch (err) {
    console.error("DB Hatası:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Tüm postları çek
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT posts.id, posts.content, posts.created_at, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC"
    );
    res.json({ posts: result.rows });
  } catch (err) {
    console.error("DB Hatası:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

module.exports = router;
