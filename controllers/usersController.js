// Import necessary models and libraries
const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Retrieve all users from the database, excluding the password field
  const users = await User.find().select("-password").lean();

  // If no users found, return a 400 response
  if (!users?.length)
    return res.status(400).json({ message: "No users found" });

  // Send the response with the list of users
  res.json(users);
});

// @desc Create a new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { username, password, roles } = req.body;

  // Confirm that all required fields are provided
  if (!username || !password)
    return res.status(200).json({ message: "All fields are required" });

  // Check for duplicate username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // If duplicate username found, return a 409 response
  if (duplicate) return res.status(409).json({ message: "Duplicate username" });

  // Hash the password before storing it in the database
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  // Create an object with the user data
  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };

  // Create and store the new user
  const user = await User.create(userObject);

  // If user is created successfully, return a 201 response
  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    // If invalid user data received, return a 400 response
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { id, username, roles, active, password } = req.body;

  // Confirm that all required fields are provided
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  )
    return res.status(400).json({ message: "All fields are required" });

  // Confirm that the user exists
  const user = await User.findById(id).exec();

  // If user does not exist, return a 400 response
  if (!user) return res.status(400).json({ message: "User not found" });

  // Check for duplicate username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id)
    return res.status(409).json({ message: "Duplicate username" });

  // Update the user with new data
  user.username = username;
  user.roles = roles;
  user.active = active;

  // If a new password is provided, hash and update it
  if (password) user.password = await bcrypt.hash(password, 10); // salt rounds

  // Save the updated user
  const updatedUser = await user.save();

  // Send a response with the updated username
  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { id } = req.body;

  // Confirm that the user ID is provided
  if (!id) return res.status(400).json({ message: "User ID required" });

  // Check if the user has assigned notes
  const note = await Note.findOne({ user: id }).lean().exec();

  // If the user has assigned notes, return a 400 response
  if (note) return res.status(400).json({ message: "User has assigned notes" });

  // Confirm that the user exists before deleting
  const user = await User.findById(id).exec();

  // If user does not exist, return a 400 response
  if (!user) return res.status(400).json({ message: "User not found" });

  // Delete the user
  await user.deleteOne();

  // Send a response with information about the deleted user
  const reply = `Username ${user.username} with ID ${user._id} deleted`;

  res.json(reply);
});

// Export the functions for use in other modules
module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
