// Import necessary modules
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");

// Apply JWT verification middleware to all routes in this router
router.use(verifyJWT);

// Define routes for handling user-related operations
router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

// Export the router for use in other modules
module.exports = router;
