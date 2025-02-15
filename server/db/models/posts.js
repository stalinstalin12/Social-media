const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    default: "", // Posts can be text-only
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String, // Category for the post (e.g., interests)
     
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  post_images: [
    {
      type: String, // Store the file paths of uploaded images
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true, // Reference to the user who created the post
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
