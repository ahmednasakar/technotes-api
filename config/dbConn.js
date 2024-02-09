// Import the Mongoose library
const mongoose = require("mongoose");

// Function to connect to the database
const connectDB = async () => {
  try {
    // Connect to the MongoDB database using the provided URI from the environment variables
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Connected to the database successfully!");
  } catch (err) {
    // Log any errors that occur during the connection attempt
    console.error("Error connecting to the database:", err.message);
  }
};

// Export the connectDB function for use in other modules
module.exports = connectDB;
