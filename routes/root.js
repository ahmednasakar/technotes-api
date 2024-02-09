// Import necessary modules
const express = require("express");
const router = express.Router();
const path = require("path");

// Define a route to handle requests for the root or index.html
router.get("^/$|/index(.html)?", (req, res) => {
  // Send the index.html file in response
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

// Export the router for use in other modules
module.exports = router;
