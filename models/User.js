// Import necessary modules
const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ["Employee"],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Export the User model based on the schema
module.exports = mongoose.model("User", userSchema);
