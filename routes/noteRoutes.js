// Import necessary modules
const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");
const verifyJWT = require("../middleware/verifyJWT");

// Apply JWT verification middleware to all routes in this router
router.use(verifyJWT);

// Define routes for handling notes
router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNewNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

// Export the router for use in other modules
module.exports = router;
