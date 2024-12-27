const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  longUrl: String,
  shortUrl: String,
  alias: String,
  topic: String,
  userId: mongoose.Schema.Types.ObjectId,
  clicks: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Url', urlSchema);

