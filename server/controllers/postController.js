const {fileUpload} = require("../utils/file-upload");
const Post = require("../db/models/posts"); // Your Post schema
const User=require("../db/models/users")

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

exports.addPost = [
  authenticate, 
  async (req, res) => {
    try {
      // Destructure the request body
      const { text, description, category, post_images } = req.body;

      // Validate input
      if (!text && (!Array.isArray(post_images) || post_images.length === 0)) {
        return res.status(400).json({
          message: "A post must contain either text or at least one image.",
        });
      }

      // Handle image uploads (if any)
      let uploadedImagePaths = [];
      if (Array.isArray(post_images) && post_images.length > 0) {
        uploadedImagePaths = await fileUpload(post_images, "posts"); // Use the fileUpload utility
      }

      // Create the post in the database
      const post = new Post({
        text,
        description,
        category,
        post_images: uploadedImagePaths, // Store the uploaded image paths
        userId: req.user.id,
      });

      // Save the post
      await post.save();

      return res.status(201).json({
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({
        message: "An error occurred while creating the post. Please try again.",
        error: error.message || error,
      });
    }
  },
];


exports.getAllPosts = async (req, res) => {
  try {
    // Fetch all posts, sorted by creation date (most recent first)
    const posts = await Post.find()
      .populate("userId", "name email") // Populate user details (name, email)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Respond with the list of posts
    return res.status(200).json({
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      message: "An error occurred while fetching posts. Please try again.",
      error: error.message || error,
    });
  }
};



exports.getPostsForUser = [authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Logged-in user's ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch posts where category matches user's interests
    const matchingPosts = await Post.find({
      category: { $in: user.interests },
    }).sort({ createdAt: -1 }); // Sort by newest first

    // Fetch posts where category does NOT match user's interests
    const otherPosts = await Post.find({
      category: { $nin: user.interests },
    }).sort({ createdAt: -1 }); // Sort by newest first

    // Combine both lists
    const combinedPosts = [...matchingPosts, ...otherPosts];

    // Enrich posts with likeCount and isLiked
    const enrichedPosts = combinedPosts.map((post) => ({
      ...post.toObject(),
      likeCount: post.likes.length, // Total number of likes
      isLiked: post.likes.includes(userId), // Whether the logged-in user has liked this post
    }));

    return res.status(200).json({
      message: "Posts retrieved successfully",
      data: enrichedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts for user:", error);
    return res.status(500).json({
      message: "An error occurred while fetching posts.",
      error: error.message || error,
    });
  }
}];



exports.getUserDetailsAndPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch posts by the user
    const posts = await Post.find({ userId });

    return res.status(200).json({
      message: "User details and posts fetched successfully",
      user: {
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio || "", // Optional: Include user bio or other fields
      },
      posts,
    });
  } catch (error) {
    console.error("Error fetching user details and posts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//likes


// Like or Unlike a Post
exports.toggleLikePost =[authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // Extract from the token middleware

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? "Post unliked" : "Post liked",
      likeCount: post.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
}];

// Get total likes for a post
exports.getPostLikes =[authenticate, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ likeCount: post.likes.length });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ message: "Server error" });
  }
}];







