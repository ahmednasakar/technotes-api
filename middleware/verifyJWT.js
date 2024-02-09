// Import required module
const jwt = require("jsonwebtoken");

// Middleware function for verifying JWT (JSON Web Token)
const verifyJWT = (req, res, next) => {
  // Retrieve the authorization header from the request
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Check if the authorization header starts with "Bearer "
  if (!authHeader?.startsWith("Bearer ")) {
    // If not, respond with Unauthorized status
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token from the authorization header
  const token = authHeader.split(" ")[1];

  // Verify the token using the ACCESS_TOKEN_SECRET
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // Handle token verification errors
    if (err) {
      // If verification fails, respond with Forbidden status
      return res.status(403).json({ message: "Forbidden" });
    }

    // Attach decoded user information to the request object
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;

    // Call the next middleware or route handler
    next();
  });
};

// Export the verifyJWT middleware for use in other parts of the application
module.exports = verifyJWT;
