const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: { type: String, required: true },
    likedSongs: { type: [String], default: [] },
    playlist: { type: [String], default: [] },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

userSchema.method.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.name, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(10).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity().required(),
    confirmPassword: passwordComplexity().required(),
    gender: Joi.string().valid("male", "female").required(),
  });
  return schema.validate(user);
};
const User = mongoose.model("User", userSchema);

module.exports = { User, validateUser };
