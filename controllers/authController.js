// Import required modules and libraries
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find the user by username in the database
  const foundUser = await User.findOne({ username }).exec();

  // Check if user exists and is active
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Compare the provided password with the hashed password stored in the database
  const match = await bcrypt.compare(password, foundUser.password);

  // If passwords don't match, respond with unauthorized status
  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Generate an access token with user information and a short expiration time
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // Generate a refresh token with the username and a longer expiration time
  const refreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create a secure cookie with the refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // Accessible only by the web server
    sameSite: "None", // Secure cookie over HTTPS
    secure: true, // Cross-site cookie
    maxAge: 7 * 24 * 60 * 1000, // Cookie expiry: set to match the refresh token expiration time
  });

  // Send the access token containing username and roles as a response
  res.json({ accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = asyncHandler(async (req, res) => {
  // Retrieve cookies from the request
  const cookies = req.cookies;

  // Check if the 'jwt' cookie is present
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the refresh token from the 'jwt' cookie
  const refreshToken = cookies.jwt;

  // Verify the refresh token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      // Handle token verification errors
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Find the user in the database using the decoded username from the refresh token
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      // If user not found, respond with unauthorized status
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Generate a new access token with user information and a short expiration time
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // Send the new access token as a response
      res.json({ accessToken });
    })
  );
});

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = asyncHandler(async (req, res) => {
  // Retrieve cookies from the request
  const cookies = req.cookies;

  // Check if the 'jwt' cookie is present
  if (!cookies?.jwt) {
    // If no 'jwt' cookie, respond with No Content status
    return res.sendStatus(204); // No Content
  }

  // Clear the 'jwt' cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  // Send a response indicating that the cookie has been cleared
  res.json({ message: "Cookie cleared" });
});

// Export the login, refresh and logout function for use in other parts of the application
module.exports = { login, refresh, logout };
