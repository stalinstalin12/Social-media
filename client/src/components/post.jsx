import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { FaCamera } from "react-icons/fa";
import { Box, Button, TextField, Typography, Grid, Card, CardContent, IconButton, Select, MenuItem, CircularProgress } from "@mui/material";

const baseUrl = "http://localhost:3002";

const CreatePost = () => {
  const [postText, setPostText] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [category, setCategory] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPostImages((prevImages) => [...prevImages, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif", ".webp"],
    },
    multiple: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!postText && postImages.length === 0) {
      alert("Please provide either text or at least one image for the post.");
      setLoading(false);
      return;
    }

    const postData = {
      text: postText || undefined,
      description: postDescription || undefined,
      category,
      post_images: postImages,
    };

    try {
      const response = await axios.post(`${baseUrl}/addPost`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: 4 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 4, color: "#D32F2F" }}>
        Create a New Post
      </Typography>

      <Card sx={{ maxWidth: 600, margin: "0 auto", padding: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Post Text Area */}
            <TextField
              fullWidth
              variant="outlined"
              label="What's on your mind?"
              multiline
              rows={4}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              sx={{ marginBottom: 2 }}
            />

            {/* Post Description */}
            <TextField
              fullWidth
              variant="outlined"
              label="Post Description"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              sx={{ marginBottom: 2 }}
            />

            {/* Category Selection */}
            <Select
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              sx={{ marginBottom: 2 }}
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Art">Art</MenuItem>
              <MenuItem value="Fitness">Fitness</MenuItem>
              <MenuItem value="Gaming">Gaming</MenuItem>
            </Select>

            {/* Image Upload Section */}
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed #1976d2",
                borderRadius: 2,
                padding: 3,
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              <FaCamera fontSize="2rem" color="#1976d2" />
              <Typography variant="body2" sx={{ color: "#1976d2" }}>
                Click or drag to add images
              </Typography>
              <input {...getInputProps()} />
            </Box>

            {/* Image Preview Section */}
            {postImages.length > 0 && (
              <Grid container spacing={2}>
                {postImages.map((image, index) => (
                  <Grid item xs={6} sm={4} lg={3} key={index}>
                    <Box sx={{ position: "relative" }}>
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        style={{
                          width: "100%",
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                        }}
                        onClick={() => setPostImages(postImages.filter((_, i) => i !== index))}
                      >
                        <Typography variant="h6" sx={{ color: "red" }}>
                          X
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ paddingX: 4, paddingY: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Post"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreatePost;
