import { useState, useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import PropTypes from "prop-types";

const CommentModal = ({ postId, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyInputs, setReplyInputs] = useState({}); // To manage reply inputs for comments

  const token = localStorage.getItem("authToken");
  const baseUrl = "http://localhost:3002"; // Replace with your backend URL

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await axios.get(`${baseUrl}/post/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const commentsData = response.data.comments || [];
      console.log(commentsData)

      const enrichedComments = await Promise.all(
        commentsData.map(async (comment) => {
          try {
            const userResponse = await axios.get(`${baseUrl}/user/${comment.userId._id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const userData = userResponse.data.data[0];
            console.log(userData)

            // Fetch replies for the comment
            console.log(`Fetching replies for comment ID: ${comment._id}`);
            const repliesResponse = await axios.get(`${baseUrl}/comments/${comment._id}/replies`, {
              headers: {
                Authorization: `bearer ${token}`,
              },
            });

            const enrichedReplies = await Promise.all(
              (repliesResponse.data.replies || []).map(async (reply) => {
                try {
                  const replyUserResponse = await axios.get(`${baseUrl}/user/${reply.userId._id}`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  const replyUserData = replyUserResponse.data.data[0];
                  return {
                    ...reply,
                    userName: replyUserData?.name || "Unknown User",
                    userProfilePicture: replyUserData?.profilePicture
                      ? `${baseUrl}/${replyUserData.profilePicture}`
                      : "https://via.placeholder.com/40",
                  };
                } catch (err) {
                  console.log(err)
                  return {
                    ...reply,
                    userName: "Unknown User",
                    userProfilePicture: "https://via.placeholder.com/40",
                  };
                }
              })
            );

            return {
              ...comment,
              userName: userData?.name || "Unknown User",
              userProfilePicture: userData?.profilePicture
                ? `${baseUrl}/${userData.profilePicture}`
                : "https://via.placeholder.com/40",
              replies: enrichedReplies,
            };
          } catch (error) {
            console.error("Error fetching comment/reply details:", error);
            return {
              ...comment,
              userName: "Unknown User",
              userProfilePicture: "https://via.placeholder.com/40",
              replies: [],
            };
          }
        })
      );

      setComments(enrichedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [postId, baseUrl, token]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${baseUrl}/post/${postId}/comment`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.comment) {
        const comment = response.data.comment;

        const userResponse = await axios.get(`${baseUrl}/user/${comment.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = userResponse.data.data[0];

        const enrichedComment = {
          ...comment,
          userName: userData?.name || "Unknown User",
          userProfilePicture: userData?.profilePicture
            ? `${baseUrl}/${userData.profilePicture}`
            : "https://via.placeholder.com/40",
          replies: [],
        };

        setComments((prev) => [enrichedComment, ...prev]);
        setNewComment("");
      } else {
        setError("Failed to add comment. Invalid response.");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
    }
  };

  const handleAddReply = async (commentId) => {
    const replyText = replyInputs[commentId];
    if (!replyText?.trim()) return;

    try {
      const response = await axios.post(
        `${baseUrl}/comment/${commentId}/reply`,
        { text: replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.reply) {
        const reply = response.data.reply;
       

        const userResponse = await axios.get(`${baseUrl}/user/${reply.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = userResponse.data.data[0];

        const enrichedReply = {
          ...reply,
          userName: userData?.name || "Unknown User",
          userProfilePicture: userData?.profilePicture
            ? `${baseUrl}/${userData.profilePicture}`
            : "https://via.placeholder.com/40",
        };

        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, replies: [...comment.replies, enrichedReply] }
              : comment
          )
        );

        setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      } else {
        setError("Failed to add reply. Invalid response.");
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      setError("Failed to add reply. Please try again.");
    }
  };

  const handleReplyInputChange = (commentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="comments-modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
        <div className="flex justify-between items-center">
          <h2 id="comments-modal-title" className="text-xl font-semibold">
            Comments
          </h2>
          <button
            onClick={onClose}
            aria-label="Close comments modal"
            className="text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
        </div>
        <div className="mt-4">
          {loading ? (
            <p>Loading comments...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : comments.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment._id} className="flex flex-col space-y-2">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.userProfilePicture}
                      alt={`${comment.userName}'s profile`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{comment.userName}</p>
                      <p className="text-gray-700">{comment.text}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Replies */}
                  <div className="ml-10 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="flex items-start space-x-3">
                        <img
                          src={reply.userProfilePicture}
                          alt={`${reply.userName}'s profile`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{reply.userName}</p>
                          <p className="text-gray-700">{reply.text}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Add Reply */}
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        className="flex-1 border rounded-lg px-4 py-2"
                        placeholder="Add a reply..."
                        value={replyInputs[comment._id] || ""}
                        onChange={(e) =>
                          handleReplyInputChange(comment._id, e.target.value)
                        }
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        className="ml-2 bg-blue-500 text-white rounded-lg px-4 py-2"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
          {/* Add Comment */}
          <div className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-blue-500 text-white rounded-lg px-4 py-2"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

CommentModal.propTypes = {
  postId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CommentModal;
