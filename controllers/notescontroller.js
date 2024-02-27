// Import necessary models and libraries
const Note = require("../models/Note");
const User = require("../models/User");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = async (req, res) => {
  // Retrieve all notes from the database
  const notes = await Note.find().lean();

  // If no notes found, return a 400 response
  if (!notes?.length)
    return res.status(400).json({ message: "No notes found" });

  // Add username to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  // Send the response with notes and associated usernames
  res.json(notesWithUser);
};

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = async (req, res) => {
  // Extract data from the request body
  const { user, title, text } = req.body;

  // Confirm data is provided
  if (!user || !title || !text)
    return res.status(400).json({ message: "All fields are required" });

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // If duplicate title found, return a 409 response
  if (duplicate)
    return res.status(409).json({ message: "Duplicate note title" });

  // Create and store the new note
  const note = await Note.create({ user, title, text });

  // If note is created successfully, return a 201 response
  if (note) {
    return res.status(201).json({ message: "New note created" });
  } else {
    // If invalid note data received, return a 400 response
    return res.status(400).json({ message: "Invalid note data received" });
  }
};

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = async (req, res) => {
  // Extract data from the request body
  const { id, user, title, text, completed } = req.body;

  // Confirm data is provided
  if (!id || !user || !title || !text || typeof completed !== "boolean")
    return res.status(400).json({ message: "All fields are required" });

  // Confirm note exists
  const note = await Note.findById(id).exec();

  // If note does not exist, return a 400 response
  if (!note) return res.status(400).json({ message: "Note not found" });

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id)
    return res.status(409).json({ message: "Duplicate note title" });

  // Update the note with new data
  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  // Save the updated note
  const updatedNote = await note.save();

  // Send a response with the updated note's title
  res.json(`'${updatedNote.title}' updated`);
};

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = async (req, res) => {
  // Extract data from the request body
  const { id } = req.body;

  // Confirm note ID is provided
  if (!id) return res.status(400).json({ message: "Note ID required" });

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  // If note does not exist, return a 400 response
  if (!note) return res.status(400).json({ message: "Note not found" });

  // Delete the note
  await note.deleteOne();

  // Send a response with the deleted note's information
  const reply = `Note '${note.title}' with ID ${note._id} deleted`;

  res.json(reply);
};

// Export the functions for use in other modules
module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
