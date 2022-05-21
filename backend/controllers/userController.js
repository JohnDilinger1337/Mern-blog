const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { validateMongodbid } = require("./utils");

// register user controller
const register = asyncHandler(async (req, res, next) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists) {
    return next(
      new Error(`User with email ${req.body.email} already exists`, 400)
    );
  }
  const { firstName, lastName, email, password } = req.body;
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });
  const token = user.generateToken();
  res.status(201).json({
    success: true,
    data: user,
    token,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("User not found", 404));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new Error("Invalid password", 401));
  }
  const token = user.generateToken();
  res.status(200).json({
    success: true,
    token,
  });
});

const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: users,
  });
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Error("User not found", 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Error("User not found", 404));
  }
  await user.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Error("User not found", 404));
  }
  const { firstName, lastName, email, bio } = req.body;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.bio = bio;
  await user.save();
  res.status(200).json({
    success: true,
    data: user,
  });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Error("User not found", 404));
  }
  const { password } = req.body;
  user.password = password;
  await user.save();
  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  login,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  updatePassword,
};