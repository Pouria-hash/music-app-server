const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const wrapAsync = require("./wrapAsync");
const ExpressError = require("./ExpressError");

// module.exports.auth = wrapAsync(async (req, res, next) => {
//   const token = req.header("X-Auth-Token");
//   if (!token) throw new ExpressError("Access denied no token", 400);

//   jwt.verify(token, process.env.JWT_SECRET, (err, validToken) => {
//     if (err) {
//       throw new ExpressError("invalid token", 401);
//     } else {
//       req.user = validToken;
//       next();
//     }
//   });
// });

// module.exports.isAdmin = wrapAsync(async (req, res, next) => {
//   const token = req.header("X-Auth-Token");
//   if (!token) throw new ExpressError("Access denied, No token", 400);

//   jwt.verify(token, process.env.JWT_SECRET, (err, validToken) => {
//     if (err) {
//       throw new ExpressError("invalid token", 401);
//     } else {
//       if (!validToken.isAdmin)
//         throw new ExpressError("Access denied, you must be Admin!", 403);
//       req.user = validToken;
//       next();
//     }
//   });
// });

module.exports.auth = wrapAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, validToken) => {
        if (err) {
          throw new ExpressError("invalid token", 401);
        } else {
          req.user = validToken;
          next();
        }
      });
    } catch (error) {
      console.log(error);
      throw new ExpressError("Not authorizate , token failed", 401);
    }
  }
  if (!token) {
    throw new ExpressError("Not authorizate , no token", 401);
  }
});

module.exports.isAdmin = wrapAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, validToken) => {
        if (err) {
          throw new ExpressError("invalid token", 401);
        } else {
          if (!validToken.isAdmin) throw new ExpressError("access denied", 403);
          req.user = validToken;
          next();
        }
      });
    } catch (error) {
      console.log(error);
      throw new ExpressError("Not authorizate , token failed", 401);
    }
  }
  if (!token) {
    throw new ExpressError("Not authorizate , no token", 401);
  }
});

module.exports.validObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    throw new ExpressError("Invalid id", 404);

  next();
};
