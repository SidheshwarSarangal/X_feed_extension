const mongoose = require("mongoose");

const FeedProviderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  token: { type: String, required: true },   // auth_token
  ct0: { type: String, required: true },     // ct0 cookie
  sharedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeedProvider", FeedProviderSchema);
