const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Database Connection
const mongoConnect = require('./db/connect');
const User = require('./db/models/users');  // Ensure User model is imported
mongoConnect().then(() => console.log("Database connected")).catch(err => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
});

// Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require("./routes/commentRoutes");

// Register Routes
app.use(userRoutes);
app.use(authRoutes);
app.use(postRoutes);
app.use(commentRoutes);

// Static File Serving
app.use('/uploads', express.static('./uploads'));
app.use(express.static(path.join(__dirname, '../client')));

// Error Handling for Invalid Routes
app.use((req, res, next) => {
    res.status(404).send({ message: "Route not found", path: req.originalUrl });
});

// Server Setup with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Adjust to your frontend URL
        methods: ["GET", "POST", 'PUT', 'DELETE', 'OPTIONS'],
    },
});

// Socket.IO Connection Handling
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for user following (Socket.IO)
    socket.on("followUser", async (followData) => {
        try {
            const { followerId, followedId } = followData;

            const follower = await User.findById(followerId);
            const followed = await User.findById(followedId);

            if (!follower || !followed) {
                return socket.emit("error", { message: "User not found" });
            }

            // Add to followers and following lists
            if (!follower.following.includes(followedId)) {
                follower.following.push(followedId);
                followed.followers.push(followerId);

                // Save changes to the database
                await follower.save();
                await followed.save();

                // Emit updated follower and following counts
                io.emit("updateFollowCounts", {
                    followerId,
                    followedId,
                    followerCount: followed.followers.length,
                    followingCount: follower.following.length,
                });

                // Emit 'follow' event to notify frontend
                io.emit("follow", { userId: followedId, followerId });
                console.log(`User ${followerId} followed ${followedId}`);
            }
        } catch (error) {
            console.error("Error following user:", error);
        }
    });

    // Listen for user unfollowing (Socket.IO)
    socket.on("unfollowUser", async (unfollowData) => {
        try {
            const { followerId, followedId } = unfollowData;

            const follower = await User.findById(followerId);
            const followed = await User.findById(followedId);

            if (!follower || !followed) {
                return socket.emit("error", { message: "User not found" });
            }

            // Remove from followers and following lists
            if (follower.following.includes(followedId)) {
                follower.following = follower.following.filter(id => id.toString() !== followedId);
                followed.followers = followed.followers.filter(id => id.toString() !== followerId);

                // Save changes to the database
                await follower.save();
                await followed.save();

                // Emit updated follower and following counts
                io.emit("updateFollowCounts", {
                    followerId,
                    followedId,
                    followerCount: followed.followers.length,
                    followingCount: follower.following.length,
                });

                // Emit 'unfollow' event to notify frontend
                io.emit("unfollow", { userId: followedId, followerId });
                console.log(`User ${followerId} unfollowed ${followedId}`);
            }
        } catch (error) {
            console.error("Error unfollowing user:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

