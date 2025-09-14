const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST, // Cloud SQL bağlantısı
});

module.exports = pool;