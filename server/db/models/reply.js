// Reply Schema (models/reply.js)
const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true }, // Reference to the parent comment
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // The user who replied
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reply", ReplySchema);
