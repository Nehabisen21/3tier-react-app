const express = require("express");
const router = express.Router();

let data = [];

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// Get data
router.get("/data", (req, res) => {
  res.json(data);
});

// Save data
router.post("/data", (req, res) => {
  data.push(req.body);
  res.json({ message: "Data saved successfully" });
});

module.exports = router;

