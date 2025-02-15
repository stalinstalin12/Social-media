const Comment = require("../db/models/comment");
const Post=require("../db/models/posts");
const User=require("../db/models/users");
const Reply = require("../db/models/reply");

//authentication middleware
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    console.log("Authorization Header:", authorizationHeader);

    // Extract token from header
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
    console.log("Extracted Token:", token);

    if (!token) {
        return res.status(401).json({ message: "No token provided. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = { id: decoded.user_id }; // Add user ID to the request
        console.log("Decoded User ID:", req.user.id);
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

//add comments

exports.addComment = [
  authenticate, // Middleware to authenticate and extract user info
  async (req, res) => {
    try {
      const { postId } = req.params; // Extract post ID from URL
      const { text } = req.body; // Extract comment text
      const userId = req.user.id; // Assuming user ID is extracted via middleware (e.g., JWT)

      // Validate post existence
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Validate user existence
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create the comment in the Comment schema
      const comment = new Comment({
        postId,
        userId,
        userName: user.name,
        userProfileImage: user.profileImage || null, // Optional profile image
        text,
      });

      // Save the comment
      await comment.save();

      // Optionally, link the comment to the post for quick reference (array of comment IDs in Post)
      post.comments.push(comment._id);
      await post.save();

      // Respond with the newly created comment inside 'comment'
      return res
        .status(201)
        .json({ message: "Comment added successfully", comment });  // Make sure 'comment' is included in the response
    } catch (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  },
];



// Get comments for a post
exports.getComments = [
  authenticate, // Middleware to authenticate and extract user info
  async (req, res) => {
    try {
      const { postId } = req.params; // Extract post ID from URL

      // Fetch comments for the given postId and populate user details
      const comments = await Comment.find({ postId })
        .populate("userId", "name ") // Populate user details
        .sort({ createdAt: -1 }); // Sort comments by newest first

      // Return the fetched comments
      res.status(200).json({ message: "Comments fetched successfully", comments });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
];

//comment count
exports.getCommentCount = [
  authenticate, // Middleware to authenticate and extract user info
  async (req, res) => {
    try {
      const { postId } = req.params; // Extract post ID from URL

      // Count the number of comments for the given postId
      const commentCount = await Comment.countDocuments({ postId });

      // Return the count of comments
      res.status(200).json({ message: "Comment count fetched successfully", count: commentCount });
    } catch (error) {
      console.error("Error fetching comment count:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
];

// Add Reply
exports.addReply =[authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // Validate parent comment existence
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the reply
    const reply = new Reply({
      commentId,
      userId,
      userName: user.name,
      text,
    });

    await reply.save();

    // Optionally, link the reply to the parent comment
    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json({ message: "Reply added successfully", reply });
  } catch (error) {
    console.error("Error adding reply:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
}];


// **Get Replies for a Comment**
exports.getReplies = [authenticate,async (req, res) => {
  try {
    const { commentId } = req.params;

    // Fetch replies for the given commentId
    const replies = await Reply.find({ commentId })
      .populate("userId", "name") // Populate user details
      .sort({ createdAt: -1 }); // Sort replies by newest first

    res.status(200).json({
      message: "Replies fetched successfully",
      replies,
    });
  } catch (error) {
    console.error("Error fetching replies:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
}];






