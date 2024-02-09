// Load environment variables from a .env file
require("dotenv").config();

// Configure Express to handle asynchronous errors globally
//require('express-async-errors')

// Import necessary modules
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");

// Set the port for the server to listen on
const PORT = process.env.PORT || 3500;

// Connect to the MongoDB database
connectDB();

// Use logger middleware for logging requests
app.use(logger);

// Enable Cross-Origin Resource Sharing (CORS) with configured options
app.use(cors(corsOptions));

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies in the request
app.use(cookieParser());

// Serve static files from the "public" directory
app.use("/", express.static(path.join(__dirname, "public")));

// Define routes for different parts of the application
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/notes", require("./routes/noteRoutes"));

// Handle all unmatched routes with a 404 response
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Use the errorHandler middleware to handle errors
app.use(errorHandler);

// Listen for MongoDB connection events
mongoose.connection.once("open", () => {
  /* console.log("Connected to MongoDB"); */
  // Start the server once MongoDB connection is open
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Log MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.log(err);
  // Log MongoDB connection error details
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
