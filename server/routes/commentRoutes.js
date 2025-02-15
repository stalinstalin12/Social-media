const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");


// Add a new comment
router.post("/post/:postId/comment", commentController.addComment);

// Get all comments for a post
router.get("/post/:postId/comments", commentController.getComments);
//comment count
router.get('/comments/count/:postId',commentController.getCommentCount);

// Add a reply to a comment
router.post("/comments/:commentId/replies", commentController.addReply);
//view rerply to a comment
router.get("/comments/:commentId/replies", commentController.getReplies);

module.exports = router;
