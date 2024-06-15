const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: String,
  email: String,
  photo: String,
  apiKey: {
    type: String,
    unique: true,
  },
  tokens: {
    type: Number,
    default: 250,
  },
  tokensLastReset: {
    type: Date,
    default: Date.now,
  },
  unlimited: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
