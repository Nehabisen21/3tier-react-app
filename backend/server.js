const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

// Root endpoint → DB connectivity check
app.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    res.status(200).json({
      status: "SUCCESS",
      message: "✅ Database Connected Successfully",
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      message: "❌ Database Connection Failed",
      error: err.message,
    });
  }
});

// Health endpoint (optional, K8s friendly)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

