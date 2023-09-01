const router = require("express").Router();
const { User } = require("../models/user");
const { Song, validateSong } = require("../models/song");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { isAdmin, validObjectId, auth } = require("../utils/middleware");

// get all songs
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const songs = await Song.find({});
    if (songs.length > 0) {
      return res.status(200).json({ data: songs });
    }

    throw new ExpressError("No products found", 404);
  })
);

// get song
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const song = await Song.findById(id);
    if (!song) throw new ExpressError("Song not found", 404);
    res.status(202).json({ data: song });
  })
);

// create song
router.post(
  "/",
  isAdmin,
  wrapAsync(async (req, res) => {
    const { error } = validateSong(req.body);
    if (error) throw new ExpressError("not valid data", 403);

    const songData = req.body;
    const song = new Song(songData);
    await song.save();
    res.status(202).json({ data: song, message: "Song created successfully" });
  })
);

// update song
router.put(
  "/:id",
  validObjectId,
  isAdmin,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const song = await Song.findByIdAndUpdate(id, req.body, { new: true });

    res.status(202).json({ data: song, message: "Song updated successfully" });
  })
);

// delete song
router.delete(
  "/:id",
  validObjectId,
  isAdmin,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Song.findByIdAndDelete(id);

    res.status(202).json({ message: "Song deleted successfully" });
  })
);

//all like song
router.get(
  "/you/likes",
  auth,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const songs = await Song.find({ _id: user.likedSongs });
    res.status(202).json({ data: songs });
  })
);

// like song
router.put(
  "/you/likes/:id",
  validObjectId,
  auth,
  wrapAsync(async (req, res) => {
    let resMsg = "";
    const { id } = req.params;
    const song = await Song.findById(id);

    if (!song) throw new ExpressError("Song does not exist!");
    const user = await User.findById(req.user._id);
    console.log(req.user);
    const index = user.likedSongs.indexOf(song._id);
    if (index === -1) {
      user.likedSongs.push(song._id);
      resMsg = "Add song to liked songs";
    } else {
      user.likedSongs.splice(index, 1);
      resMsg = "Remove song from liked songs";
    }
    await user.save();
    res.status(202).json({ message: resMsg });
  })
);

module.exports = router;
