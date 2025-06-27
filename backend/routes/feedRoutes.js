const express = require('express');
const router = express.Router();
const { loginUser, getFeed } = require('../controllers/feedController');

router.post('/login', loginUser);          // Login and store cookies
router.get('/feed/:username', getFeed);    // Retrieve user's feed using saved session

module.exports = router;
