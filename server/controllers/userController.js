const users = require('../db/models/users');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const bcrypt = require('bcryptjs');
const fileUpload = require('../utils/file-upload').fileUpload;
const mongoose = require('mongoose');
const Post=require('../db/models/posts')

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



exports.createUser = async function (req, res) {
  try {
    let body=req.body;
    let name=req.body.name;
    let email=req.body.email;
    let username=req.body.username;
    let password=req.body.password;
    let age=req.body.age;
    let bio=req.body.bio;
    let interests=req.body.interests;
    let profilePicture=req.body.profilePicture;
    body.user_type='676ba1c1fd30e9f16f59769b'
    // Step 1: Basic Validations
    if (!name || !email || !username || !password || !age ) {
      return res.status(400).send({
        message: "All required fields (name, email, username, password, age) must be provided",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({ message: "Password must be at least 6 characters long" });
    }

    if (age < 13) {
      return res.status(400).send({ message: "Age must be 13 or older" });
    }

    // Step 2: Check for existing user
    const existingUser = await users.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).send({ message: "Email or username already exists" });
    }

    //profile picture

    let uploadedProfilePicture = '';
    if (profilePicture) {
      try {
        const uploadedPaths = await fileUpload([profilePicture], 'profilePictures'); // Pass the base64 image to fileUpload
        uploadedProfilePicture = uploadedPaths[0]; // Get the uploaded file path
      } catch (uploadError) {
        console.error("Profile picture upload error:", uploadError);
        return res.status(400).send({ message: "Failed to upload profile picture" });
      }
    }

    // Step 3: Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: Create the user object
    const newUser = new users({
      name,
      email,
      username,
      password: hashedPassword,
      age,
      interests: interests || [], // Default to empty array if not provided
      bio: bio || "", // Default to empty string if not provided
      profilePicture: uploadedProfilePicture || "", // Default to empty string if not provided
      user_type:body.user_type
    });

    // Step 5: Save the user to the database
    await newUser.save();

    // Step 6: Respond with success
    res.status(201).send({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        age: newUser.age,
        interests: newUser.interests,
        bio: newUser.bio,
        profilePicture: newUser.profilePicture,
        user_type: newUser.user_type,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Something went wrong. Please try again later." });
  }
};


exports.getAllUsers = async function (req, res) {
    try {
        let usersData = await users.find();
        console.log("usersData : ", usersData);

        let response = success_function({
            statusCode: 200,
            data: usersData,
            message: "Users fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;

    } catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        })

        res.status(response.statusCode).send(response);
        return;
    }
}

exports.getSingleUser = async function (req, res) {
    try {
        let id = req.params.id;
        console.log("id : ", id);

        let userData = await users.find({ _id: id });
        console.log("userData : ", userData);

        let response = success_function({
            statusCode: 200,
            data: userData,
            message: "User data fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;

    } catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        })

        res.status(response.statusCode).send(response);
        return;
    }
}

exports.deleteUser=async function (req,res) {
    try {
        let id=req.params.id;
        
        let deleteuser=await users.deleteOne({_id:id});

        if(deleteuser){
            let response=success_function({
                statusCode:200,
                message:"User deleted successfully"
            });
            res.status(response.statusCode).send(response.statusCode);  
        }
        else{
            let response=error_function({
                statusCode:400,
                message:"failed to delete"
            });
            res.status(response.statusCode).send(response.statusCode);
        }
    }
    
    catch (error) {
        console.log("error :",error);
        let response = error_function({
            statusCode : 400,
            message : error.message ? error.message : "something went wrong"
        })
        res.status(response.statusCode).send(response.statusCode);   
    }
}

// function to view the logged-in user's profile
exports.viewUserProfile = [authenticate,async function (req, res) {
    try {
        // Get the logged-in user's ID from the request (added by authenticate middleware)
        const userId = req.user.id;

        // Fetch the logged-in user's profile from the database using their user ID
        let userData = await users.findById(userId);

        if (!userData) {
            return res.status(404).json({ message: "User not found." });
        }

        // Respond with the user data
        let response = success_function({
            statusCode: 200,
            data: userData,
            message: "User profile fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;

    } catch (error) {
        console.log("Error:", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        });

        res.status(response.statusCode).send(response);
        return;
    }
}];

//update user details
exports.updateUser = [authenticate, async function (req, res) {
    try {
        // Get the logged-in user's ID from the request (added by authenticate middleware)
        const userId = req.user.id;

        // Fetch the request body
        const { name, email,  address } = req.body;
        const updateFields = {};

        // Validate the fields and only update if provided
        if (name) {
            if (!/^[a-zA-Z]+([ '-][a-zA-Z]+)*$/.test(name)) {
                return res.status(400).json({ message: "Invalid name format" });
            }
            updateFields.name = name;
        }

        if (email) {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            // Check if email is already in use by another user
            const emailExists = await users.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            updateFields.email = email;
        }

       
        // Address validation (if provided)
        if (address) {
            if (typeof address !== "string" || address.trim().length === 0) {
                return res.status(400).json({ message: "Invalid address" });
            }
            updateFields.address = address.trim(); // Sanitize the input
        }

        // If no fields to update are provided
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        // Update the user record
        const updatedUser = await users.findByIdAndUpdate(userId, updateFields, {
            new: true, // Return the updated user
            runValidators: true, // Ensure validations run
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with success
        let response = success_function({
            statusCode: 200,
            data: updatedUser,
            message: "User details updated successfully",
        });

        res.status(response.statusCode).send(response);

    } catch (error) {
        console.error("Error:", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        });

        res.status(response.statusCode).send(response);
    }
}];


// // Follow a user
// exports.followUser = [authenticate, async (req, res) => {
//     try {
//       const userId = req.user.id; // Logged-in user's ID
//       const { targetUserId } = req.params; // Target user to follow
  
//       if (userId === targetUserId) {
//         return res.status(400).json({ message: "You cannot follow yourself." });
//       }
  
//       const user = await users.findById(userId);
//       const targetUser = await users.findById(targetUserId);
  
//       if (!user || !targetUser) {
//         return res.status(404).json({ message: "User not found." });
//       }
  
//       // Check if already following
//       if (user.following.includes(targetUserId)) {
//         return res.status(400).json({ message: "Already following this user." });
//       }
  
//       // Add target user to following list of the logged-in user
//       user.following.push(targetUserId);
//       // Add logged-in user to the target user's followers list
//       targetUser.followers.push(userId);
  
//       await user.save();
//       await targetUser.save();
  
      
  
//       return res.status(200).json({
//         message: "Successfully followed the user.",
//         following: user.following,
//         followers: targetUser.followers,
//       });
//     } catch (error) {
//       console.error("Error following user:", error);
//       return res.status(500).json({
//         message: "An error occurred while following the user.",
//         error: error.message || error,
//       });
//     }
//   }];



//   // Unfollow a user
// exports.unfollowUser = [authenticate, async (req, res) => {
//     try {
//       const userId = req.user.id; // Logged-in user's ID
//       const { targetUserId } = req.params; // Target user to unfollow
  
//       if (userId === targetUserId) {
//         return res.status(400).json({ message: "You cannot unfollow yourself." });
//       }
  
//       const user = await users.findById(userId);
//       const targetUser = await users.findById(targetUserId);
  
//       if (!user || !targetUser) {
//         return res.status(404).json({ message: "User not found." });
//       }
  
//       // Check if not following
//       if (!user.following.includes(targetUserId)) {
//         return res.status(400).json({ message: "Not following this user." });
//       }
  
//       // Remove target user from following list of the logged-in user
//       user.following = user.following.filter(id => id.toString() !== targetUserId);
//       // Remove logged-in user from the target user's followers list
//       targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
  
//       await user.save();
//       await targetUser.save();
  
      
  
//       return res.status(200).json({
//         message: "Successfully unfollowed the user.",
//         following: user.following,
//         followers: targetUser.followers,
//       });
//     } catch (error) {
//       console.error("Error unfollowing user:", error);
//       return res.status(500).json({
//         message: "An error occurred while unfollowing the user.",
//         error: error.message || error,
//       });
//     }
//   }];


//   //get user followers
//   exports.viewFollowers = [authenticate,async (req, res) => {
//     try {
//       const userId = req.params.userId;
//       const user = await users.findById(userId).populate('followers', 'name profilePicture');
  
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       return res.status(200).json({
//         message: "User followers retrieved successfully",
//         data: user.followers,
//       });
//     } catch (error) {
//       console.error("Error fetching followers:", error);
//       return res.status(500).json({ message: "Error fetching followers" });
//     }
//   }];

//   // View users followed by a user
// exports.viewFollowing = [authenticate,async (req, res) => {
//     try {
//       const userId = req.params.userId; // The user whose following list we want to view
  
//       // Find the user by userId
//       const user = await users.findById(userId).populate('following', 'name email profilePicture'); // Populate following users' details
  
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       return res.status(200).json({
//         message: "Following users fetched successfully",
//         following: user.following, // This will return the populated following users
//       });
//     } catch (error) {
//       console.error("Error fetching following:", error);
//       return res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }];

const socketIo = require('socket.io');

// Follow a user
exports.followUser = [authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Logged-in user's ID
        const { targetUserId } = req.params; // Target user to follow

        if (userId === targetUserId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const user = await users.findById(userId);
        const targetUser = await users.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already following
        if (user.following.includes(targetUserId)) {
            return res.status(400).json({ message: "Already following this user." });
        }

        // Add target user to following list of the logged-in user
        user.following.push(targetUserId);
        // Add logged-in user to the target user's followers list
        targetUser.followers.push(userId);

        await user.save();
        await targetUser.save();

        // Emit the event to update all connected clients
        if (global.io) {
            global.io.emit("updateFollowCounts", {
                userId,
                targetUserId,
                followerCount: targetUser.followers.length,
                followingCount: user.following.length,
            });
            global.io.emit("follow", {
                userId,
                targetUserId
            });
        }

        return res.status(200).json({
            message: "Successfully followed the user.",
            following: user.following,
            followers: targetUser.followers,
        });
    } catch (error) {
        console.error("Error following user:", error);
        return res.status(500).json({
            message: "An error occurred while following the user.",
            error: error.message || error,
        });
    }
}];

// Unfollow a user
exports.unfollowUser = [authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Logged-in user's ID
        const { targetUserId } = req.params; // Target user to unfollow

        if (userId === targetUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself." });
        }

        const user = await users.findById(userId);
        const targetUser = await users.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if not following
        if (!user.following.includes(targetUserId)) {
            return res.status(400).json({ message: "Not following this user." });
        }

        // Remove target user from following list of the logged-in user
        user.following = user.following.filter(id => id.toString() !== targetUserId);
        // Remove logged-in user from the target user's followers list
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

        await user.save();
        await targetUser.save();

        // Emit the event to update all connected clients
        if (global.io) {
            global.io.emit("updateFollowCounts", {
                userId,
                targetUserId,
                followerCount: targetUser.followers.length,
                followingCount: user.following.length,
            });
            global.io.emit("unfollow", {
                userId,
                targetUserId
            });
        }

        return res.status(200).json({
            message: "Successfully unfollowed the user.",
            following: user.following,
            followers: targetUser.followers,
        });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        return res.status(500).json({
            message: "An error occurred while unfollowing the user.",
            error: error.message || error,
        });
    }
}];

// Get user followers
exports.viewFollowers = [authenticate, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await users.findById(userId).populate('followers', 'name profilePicture');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User followers retrieved successfully",
            data: user.followers,
        });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return res.status(500).json({ message: "Error fetching followers" });
    }
}];

// View users followed by a user
exports.viewFollowing = [authenticate, async (req, res) => {
    try {
        const userId = req.params.userId; // The user whose following list we want to view

        const user = await users.findById(userId).populate('following', 'name email profilePicture'); // Populate following users' details

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Following users fetched successfully",
            following: user.following, // This will return the populated following users
        });
    } catch (error) {
        console.error("Error fetching following:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}];

  
  
  
  

  exports.search = async (req, res) => {
    const { query } = req.query;
  
    try {
      // Search posts or users based on the query
      const posts = await Post.find({ text: { $regex: query, $options: "i" } });
      const User = await users.find({ name: { $regex: query, $options: "i" } });
  
      res.json({ data: { posts, User } });
    } catch (error) {
      console.error("Search error:", error.message);
      res.status(500).json({ error: "Failed to perform search" });
    }
  };
  
  