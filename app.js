if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const songRoutes = require("./router/songRoutes");
const userRoutes = require("./router/userRoutes");
const playlistRoutes = require("./router/playlistRoutes");
const searchRoutes = require("./router/searchRoutes");

mongoose
  .connect("mongodb://127.0.0.1:27017/music-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to database successfully"))
  .catch((err) => console.log(err));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("api running ...");
});

app.use("*", (req, res, next) => {
  next(new Error("api not found"));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (!err.message) err.message === "invalid data";

  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : null,
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
