// Import the list of allowed origins
const allowedOrigins = require("./allowedOrigins");

// CORS options configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Check if the request origin is in the list of allowed origins or is undefined
    if (allowedOrigins.includes(origin) || !origin) {
      // Allow the request
      callback(null, true);
    } else {
      // Block the request with a CORS error
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable credentials (e.g., cookies, authorization headers)
  optionsSuccessStatus: 200, // Set the HTTP status code for preflight success
};

// Export the CORS options for use in other modules
module.exports = corsOptions;
