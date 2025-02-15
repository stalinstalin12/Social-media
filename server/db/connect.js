const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function mongoConnect() {
    try {
        console.log("mongodb uri : ", process.env.MONGODB_URI)
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connection established...");
        
    } catch (error) {
        console.log("Database connectin error : ", error);
    }
}

module.exports  = mongoConnect;