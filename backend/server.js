const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const puppeteer = require('puppeteer');

const feedRoutes = require("./routes/feedRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route FIRST (before other routes)
app.get("/test", (req, res) => {
  res.json({ message: "✅ Server and routing working!" });
});

// Routes - put this AFTER the test route
app.use("/", feedRoutes);


// MongoDB Connection + Server Start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });