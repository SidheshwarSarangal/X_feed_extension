const { Client } = require('twikit');
const FeedProvider = require('../models/FeedProvider');

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  try {
    const client = new Client();
    await client.login({ username, password });

    const session = await client.getSession(); // contains ct0, auth_token, etc.

    await FeedProvider.findOneAndUpdate(
      { username },
      { session, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: `Login successful for @${username}` });
  } catch (err) {
    res.status(401).json({ message: "Login failed", error: err.message });
  }
};

const getFeed = async (req, res) => {
  const { username } = req.params;

  const record = await FeedProvider.findOne({ username });
  if (!record || !record.session)
    return res.status(404).json({ message: "No session found" });

  try {
    const client = new Client();
    await client.setSession(record.session);
    const feed = await client.getUserTimeline();

    res.json({ feed });
  } catch (err) {
    res.status(500).json({ message: "Failed to get feed", error: err.message });
  }
};

module.exports = {
  loginUser,
  getFeed,
};
