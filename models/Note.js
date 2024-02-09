// Import necessary modules
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define the schema for the Note model
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User model
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Add AutoIncrement plugin to generate a ticket number for each note
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket", // Name of the field to store the ticket number
  id: "ticketNums", // ID used to track the counter state
  start_seq: 500, // Starting value for the ticket number
});

// Export the Note model based on the schema
module.exports = mongoose.model("Note", noteSchema);
