const FeedProvider = require("../models/FeedProvider");
const { fetchFeedFromTwikit } = require("../utils/twikitFetcher"); // You can stub this for now

// Save auth token and ct0 for a user
const registerFeed = async (req, res) => {
  const { username, token, ct0 } = req.body;

  if (!username || !token || !ct0) {
    return res.status(400).json({ message: "Missing username or tokens" });
  }

  try {
    await FeedProvider.findOneAndUpdate(
      { username },
      { token, ct0, sharedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ message: `Feed access registered for @${username}` });
  } catch (err) {
    res.status(500).json({ message: "DB error", error: err.message });
  }
};

// Get a feed using saved tokens
const getFeed = async (req, res) => {
  const { username } = req.query;

  try {
    const provider = await FeedProvider.findOne({ username });
    if (!provider) {
      return res.status(404).json({ message: "Feed not found or not shared yet" });
    }

    const { token, ct0 } = provider;

    // Get feed using the tokens (stubbed for now)
    const feed = await fetchFeedFromTwikit(token, ct0);
    res.json({ feed });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feed", error: err.message });
  }
};

module.exports = { registerFeed, getFeed };
