import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { TextField, IconButton, Grid, Typography, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

const baseUrl = "http://localhost:3002";

const useStyles = makeStyles({
  searchBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  searchButton: {
    marginLeft: "8px",
    backgroundColor: "#f44336",
    color: "#fff",
  },
  resultCard: {
    marginBottom: "16px",
    padding: "16px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
});

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const classes = useStyles();

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${baseUrl}/search`, { params: { query } });
      console.log("API Response:", response.data);
      const { posts = [], User = [] } = response.data.data || {}; // Fixed 'User' to 'users'
      setResults({ posts, users: User });
    } catch (err) {
      console.error("Failed to search:", err.message);
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <header className="bg-red-600 p-4 text-white">
        <Typography variant="h4" fontWeight="bold">Search</Typography>
      </header>

      <main className="container mx-auto">
        <Box className={classes.searchBox}>
          <TextField
            variant="outlined"
            label="Search by category or user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnterKey}
            fullWidth
            size="small"
          />
          <IconButton
            onClick={handleSearch}
            className={classes.searchButton}
            aria-label="search"
            size="large"
          >
            <FaSearch />
          </IconButton>
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        {loading ? (
          <CircularProgress />
        ) : (
          <div className="mt-4 space-y-4">
            {results.posts.length === 0 && results.users.length === 0 ? (
              <Typography>No results found.</Typography>
            ) : (
              <>
                {results.posts.length > 0 && (
                  <div>
                    <Typography variant="h6" gutterBottom>Posts</Typography>
                    <Grid container spacing={3}>
                      {results.posts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post._id}>
                          <Card className={classes.resultCard}>
                            <CardContent>
                              <Link to={`/post/${post._id}`} style={{ textDecoration: 'none' }}>
                                <Typography variant="h6" color="secondary">{post.title}</Typography>
                                <Typography variant="body2" color="textSecondary" noWrap>{post.text}</Typography>
                              </Link>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                )}
                {results.users.length > 0 && (
                  <div>
                    <Typography variant="h6" gutterBottom>Users</Typography>
                    <Grid container spacing={3}>
                      {results.users.map((user) => (
                        <Grid item xs={12} sm={6} md={4} key={user._id}>
                          <Card className={classes.resultCard}>
                            <CardContent>
                              <Link to={`/user/${user._id}`} style={{ textDecoration: 'none' }}>
                                <Typography variant="h6" color="primary">{user.name}</Typography>
                                <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                              </Link>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
