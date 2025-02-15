const mongoose = require('mongoose');
const user_type = require('./user_type');
const users = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    interests: {
        type: [String], // Array of interests for the user
        default: [],
      },
      bio: {
        type: String,
        default: "",
      },
      profilePicture: {
        type: String,
        default: "",
      },
      followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      }],
      following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      }],
      age: {
        type: Number,
        required: true,
        min: 15, // Minimum age validation
      },
    
    user_type : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user_types"
    }    
},
{
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
}
);

module.exports = mongoose.model("users", users);