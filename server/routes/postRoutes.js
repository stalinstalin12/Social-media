// const express = require("express");
// const router = express.Router();
// const postController = require("../controllers/postController");

// // Route to create a new post
// router.post("/addPost", postController.addPost);
// router.get("/viewPosts",postController.getAllPosts);
// router.get("/viewPostsForUser",postController.getPostsForUser);
// router.get('/userandpost/:userId',postController.getUserDetailsAndPosts);
// router.post("/post/:postId/like", postController.toggleLikePost);
// router.post("/post/:postId/unlike", postController.toggleLikePost);

// // Route to get total likes for a post
// router.get("/post/:postId/likes",postController.getPostLikes);
// module.exports = router;

const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Route to create a new post
router.post("/addPost", postController.addPost);

// Route to get all posts
router.get("/viewPosts", postController.getAllPosts);

// Route to get posts personalized for a user (based on their interests)
router.get("/viewPostsForUser", postController.getPostsForUser);

// Route to fetch user details along with their posts
router.get("/userandpost/:userId", postController.getUserDetailsAndPosts);

// Route to toggle like or unlike a post
router.post("/post/:postId/toggleLike", postController.toggleLikePost);

// Route to get total likes for a post
router.get("/post/:postId/likes", postController.getPostLikes);

module.exports = router;

