const User = require("../models/user");
const jwt = require("jsonwebtoken");
const wrapAsync = require("./wrapAsync");
const ExpressError = require("./ExpressError");

module.exports.protect = wrapAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log(error);
      throw new ExpressError("Not authorizate , token failed", 401);
    }
  }
  if (!token) {
    throw new ExpressError("Not authorizate , no token", 401);
  }
});
