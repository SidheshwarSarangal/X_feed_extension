const express = require("express");
const router = express.Router();
const { registerFeed, getFeed } = require("../controllers/feedController");

router.post("/register-feed", registerFeed);    // POST for token storage
router.get("/get-feed", getFeed);              // GET for feed retrieval

module.exports = router;
