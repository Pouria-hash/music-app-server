const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/passManager");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const generateToken = require("../utils/generateToken");
const { protect } = require("../utils/protect");
const { isAdmin, validObjectId, auth } = require("../utils/middleware");

// create user
router.post(
  "/register",
  wrapAsync(async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) throw new ExpressError(error.details[0].message, 400);

    const { password, confirmPassword, email, name, gender } = req.body;
    if (password !== confirmPassword) {
      throw new ExpressError(`Invalid password`, 401);
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new ExpressError("User already exists", 400);
    }
    const hasedPassword = await hashPassword(password);
    const user = new User({ password: hasedPassword, name, gender, email });
    const newUser = await user.save();

    newUser.password = undefined;
    newUser._v = undefined;

    res.status(200).json({
      message: "Account created successfully",
      data: newUser,
    });
  })
);

router.post(
  "/login",
  wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ExpressError("Invalid email or password", 401);
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) throw new ExpressError("Invalid password or email", 401);

    const token = generateToken(user);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      likedSongs: user.likedSongs,
      playlist: user.playlist,
      token: token,
    });
  })
);

// get user profile
router.get(
  "/profile",
  auth,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.status(200).json({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        message: "user is already sign in",
      });
    } else {
      throw new ExpressError("user not found", 404);
    }
  })
);

// Admin routes

// get all users
router.get(
  "/admin",
  isAdmin,
  wrapAsync(async (req, res) => {
    const users = await User.find().select("-password -__v");
    res.status(200).json({ data: users });
  })
);

// get user by id
router.get(
  "/admin/:id",
  validObjectId,
  isAdmin,
  wrapAsync(async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id).select("-password -__v");
    res.status(200).json({ data: user });
  })
);

// update user by id
router.put(
  "/admin/:id",
  validObjectId,
  isAdmin,
  wrapAsync(async (req, res) => {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).select("-password -__v");
    res.status(200).json({ data: user });
  })
);
// delete user by id
router.delete(
  "/admin/:id",
  validObjectId,
  isAdmin,
  wrapAsync(async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Successfully delete user" });
  })
);

module.exports = router;
