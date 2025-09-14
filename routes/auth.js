const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");  // DB bağlantısı
const router = express.Router();

/**
 * Kullanıcı Kayıt
 */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Eksik bilgi" });
  }

  try {
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Veritabanına ekle (password_hash olarak)
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    return res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("DB Hatası:", err);

    // UNIQUE constraint hatası (email zaten kayıtlı)
    if (err.code === "23505") {
      return res.status(409).json({ message: "Bu e-mail zaten kayıtlı" });
    }

    return res.status(500).json({ message: "Database error", error: err.message });
  }
});

/**
 * Kullanıcıları Listele
 * Normalde auth kontrolü eklenmeli
 */
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users ORDER BY id ASC");
    return res.json({ users: result.rows });
  } catch (err) {
    console.error("DB Hatası:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
});

/**
 * Kullanıcı Giriş
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Eksik bilgi" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    // password yerine password_hash kullan
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) return res.status(401).json({ message: "Şifre hatalı" });

    // Başarılı giriş
    return res.status(200).json({
      message: "User logged in",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("DB Hatası:", err);
    return res.status(500).json({ message: "Database error", error: err.message });
  }
});

module.exports = router;
