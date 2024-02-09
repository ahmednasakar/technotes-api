// Import required modules and libraries
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

// Define routes for authentication
router.route("/").post(loginLimiter, authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

// Export the router for use in other parts of the application
module.exports = router;
