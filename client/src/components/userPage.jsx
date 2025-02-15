import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { Button, Card, CardContent, Grid, Typography, CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";

const socket = io("http://localhost:3002");
const baseUrl = "http://localhost:3002";
let token = localStorage.getItem("authToken");

const useStyles = makeStyles({
  postCard: {
    maxWidth: 345,
    maxHeight:250,
    margin: "10px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
  postImage: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  followButton: {
    margin: "8px",
  },
});

const UserPage = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [error, setError] = useState(null);
  const [followMessage, setFollowMessage] = useState(null);

  const classes = useStyles();

  useEffect(() => {
    const fetchUserDetailsAndPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${baseUrl}/userandpost/${userId}`);
        if (response.data) {
          setUserDetails(response.data.user || {});
          setPosts(response.data.posts || []);
          const followStatus = response.data.user?.isFollowing || false;
          setIsFollowing(followStatus);
          setFollowersCount(response.data.user?.followers?.length || 0);
          localStorage.setItem(`isFollowing-${userId}`, followStatus);
        } else {
          throw new Error("Invalid response data");
        }
      } catch (error) {
        setError("Failed to load user details or posts");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetailsAndPosts();

    socket.on("updateFollowers", ({ updatedUserId, change }) => {
      if (userId === updatedUserId) {
        setFollowersCount((prev) => prev + change);
      }
    });

    socket.on("follow", (data) => {
      if (data.userId === userId) {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    });

    socket.on("unfollow", (data) => {
      if (data.userId === userId) {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      }
    });

    return () => {
      socket.off("updateFollowers");
      socket.off("follow");
      socket.off("unfollow");
    };
  }, [userId]);

  useEffect(() => {
    const persistedFollowStatus = localStorage.getItem(`isFollowing-${userId}`);
    if (persistedFollowStatus !== null) {
      setIsFollowing(persistedFollowStatus === "true");
    }
  }, [userId]);

  const handleFollow = async () => {
    if (isFollowing) {
      setFollowMessage("You are already following this user.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        setFollowMessage("Successfully followed the user.");
        localStorage.setItem(`isFollowing-${userId}`, true);

        socket.emit("follow", { userId, followerId: response.data.followerId });
      }
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/unfollow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        setFollowMessage("Successfully unfollowed the user.");
        localStorage.setItem(`isFollowing-${userId}`, false);

        socket.emit("unfollow", { userId, followerId: response.data.followerId });
      }
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Typography>No user found.</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10">
          <img
            src={`${baseUrl}/${userDetails.profilePicture || "default-profile.jpg"}`}
            alt={`${userDetails.name}'s profile`}
            className="w-32 h-32 rounded-full border-2 border-red-400 object-cover shadow-lg"
          />
          <div className="text-center md:text-left">
            <div className="flex items-center space-x-4 mb-4">
              <Typography variant="h5">{userDetails.name || "Anonymous"}</Typography>
              {isFollowing ? (
                <Button
                  onClick={handleUnfollow}
                  className={classes.followButton}
                  variant="contained"
                  color="secondary"
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  className={classes.followButton}
                  variant="contained"
                  color="primary"
                >
                  Follow
                </Button>
              )}
            </div>
            <div className="flex justify-center md:justify-start space-x-8 text-gray-600">
              <Typography>
                <strong>{posts.length}</strong> Posts
              </Typography>
              <Typography>
                <strong>{followersCount}</strong> Followers
              </Typography>
              <Typography>
                <strong>{userDetails.following?.length || 0}</strong> Following
              </Typography>
            </div>
            <Typography variant="body2" color="textSecondary" className="mt-4">
              {userDetails.bio || "No bio available"}
            </Typography>
          </div>
        </div>
      </div>

      {/* Follow/Unfollow Message */}
      {followMessage && (
        <div className="bg-yellow-200 text-gray-800 p-4 text-center">
          <Typography>{followMessage}</Typography>
        </div>
      )}

      {/* Posts Section */}
      <div className="container mx-auto px-4 py-8">
        <Grid container spacing={4} justifyContent="center">
          {posts.length === 0 ? (
            <Typography variant="body1" color="textSecondary" align="center" fullWidth>
              No posts available.
            </Typography>
          ) : (
            posts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <Card className={classes.postCard}>
                  <CardContent>
                    <Typography variant="body1" color="textPrimary" paragraph>
                      {post.text}
                    </Typography>
                    {post.post_images && post.post_images.length > 0 && (
                      <ImageCarousel images={post.post_images} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </div>
    </div>
  );
};

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative">
      <img
        src={`${baseUrl}/${images[currentIndex]}`}
        alt="Post image"
        className="w-full rounded-lg"
      />
      <button
        onClick={prevImage}
        className="absolute top-1/2 left-4 text-white text-3xl"
      >
        <FaArrowLeft />
      </button>
      <button
        onClick={nextImage}
        className="absolute top-1/2 right-4 text-white text-3xl"
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default UserPage;
