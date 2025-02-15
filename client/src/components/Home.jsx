// localStorage.clear()
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaPlus, FaSearch, FaHome, FaComment, FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";
import CommentModal from "./comment";
import { toast } from "react-toastify";
import { Box, Typography, IconButton, Avatar, CircularProgress, Button, Grid, Card, CardContent, CardMedia } from "@mui/material";

const baseUrl = "http://localhost:3002";
const socket = io(baseUrl);

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await axios.get(`${baseUrl}/userprofile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfilePicture(response.data.data.profilePicture);
        } catch (error) {
          console.error("Failed to fetch profile picture:", error.message);
        }
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    };

    fetchProfilePicture();
  }, []);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.warning("Please log in to view the home page.");
      navigate("/login");
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const postsRoute = token ? "/viewPostsForUser" : "/viewPosts";
        const response = await axios.get(`${baseUrl}${postsRoute}`, { headers });

        const postsData = response.data.data || [];
        const enrichedPosts = token
          ? await Promise.all(
              postsData.map(async (post) => {
                try {
                  const userResponse = await axios.get(`${baseUrl}/user/${post.userId}`);
                  const userData = userResponse.data.data[0];

                  const commentCountResponse = await axios.get(`${baseUrl}/comments/count/${post._id}`, { headers });
                  const commentCount = commentCountResponse.data.count;

                  return {
                    ...post,
                    userName: userData?.name || "Unknown User",
                    userProfileImage: userData?.profilePicture
                      ? `${baseUrl}/${userData.profilePicture}`
                      : "https://via.placeholder.com/40",
                    commentCount,
                  };
                } catch (error) {
                  console.error("Failed to fetch user details:", error.message);
                  return post;
                }
              })
            )
          : postsData;

        setPosts(enrichedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isLoggedIn) {
      fetchPosts();
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    socket.on("commentAdded", (newCommentData) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === newCommentData.postId
            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
            : post
        )
      );
    });

    return () => {
      socket.off("commentAdded");
    };
  }, []);

  const handleLikeToggle = async (postId, isLiked) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in to like posts!");
      return;
    }

    try {
      const action = isLiked ? "unlike" : "like";
      console.log(action)
      const response = await axios.post(
        `${baseUrl}/post/${postId}/toggleLike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likeCount: response.data.likeCount, isLiked: !isLiked }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to toggle like:", error.message);
    }
  };

  const openCommentModal = (postId) => {
    setSelectedPostId(postId);
    setCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setSelectedPostId(null);
    setCommentModalOpen(false);
  };

  if (authLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Box sx={{ backgroundColor: "#d32f2f", padding: 2, position: "sticky", top: 0, zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" color="white" fontWeight="bold">
            InterestNet
          </Typography>

          <Box sx={{ display: "flex", gap: 4 }}>
            <Link to="/">
              <IconButton color="white">
                <FaHome />
                <Typography variant="body2" color="white">Home</Typography>
              </IconButton>
            </Link>
            <Link to="/search">
              <IconButton color="white">
                <FaSearch />
                <Typography variant="body2" color="white">Find</Typography>
              </IconButton>
            </Link>
            <Link to="/Post">
              <IconButton color="white">
                <FaPlus />
                <Typography variant="body2" color="white">Create</Typography>
              </IconButton>
            </Link>
          </Box>

          <Box>
            {isLoggedIn ? (
              <Link to="/profile">
                <Avatar
                  alt="Profile"
                  src={`${baseUrl}/${profilePicture}`}
                  sx={{ width: 40, height: 40 }}
                />
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="contained" color="secondary" startIcon={<FaUser />}>
                  Login
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", padding: 4 }}>
        <Grid container spacing={4}>
          {/* Posts */}
          <Grid item xs={12} md={9}>
            {loading ? (
              <CircularProgress />
            ) : posts.length === 0 ? (
              <Typography>No posts available.</Typography>
            ) : (
              <Grid container spacing={4}>
                {posts.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <Card sx={{ boxShadow: 3, borderRadius: 3, transition: "transform 0.3s ease", '&:hover': { transform: 'scale(1.05)' } }}>
                      <CardContent sx={{ paddingBottom: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Link to={`/user/${post.userId}`}>
                            <Avatar alt="User" src={post.userProfileImage} sx={{ width: 50, height: 50 }} />
                          </Link>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">{post.userName}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(post.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography sx={{ marginTop: 2 }}>{post.text}</Typography>

                        {post.post_images && post.post_images.length > 0 && (
                          <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                            {post.post_images.map((image, index) => (
                              <CardMedia
                                key={index}
                                component="img"
                                image={`${baseUrl}/${image}`}
                                alt={`Post Image ${index + 1}`}
                                sx={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 2 }}
                              />
                            ))}
                          </Box>
                        )}

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                        {/* Like Section */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton onClick={() => handleLikeToggle(post._id, post.isLiked)}>
                            <FaThumbsUp color={post.isLiked ? "red" : "gray"} />
                          </IconButton>
                          <Typography variant="body2" sx={{ marginLeft: 1 }}>
                            {post.likeCount}
                          </Typography>
                        </Box>

                        {/* Comment Section */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton onClick={() => openCommentModal(post._id)}>
                            <FaComment />
                          </IconButton>
                          <Typography variant="body2" sx={{ marginLeft: 1 }}>
                            {post.commentCount}
                          </Typography>
                        </Box>
                      </Box>

                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>

      <CommentModal isOpen={isCommentModalOpen} postId={selectedPostId} onClose={closeCommentModal} />
    </Box>
  );
};

export default Home;
