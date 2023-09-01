const router = require("express").Router();
const { Song } = require("../models/song");
const { Playlist } = require("../models/playlist");
const { auth } = require("../utils/middleware");
const wrapAsync = require("../utils/wrapAsync");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const search = req.query.search;
    if (search !== "") {
      const songs = await Song.find({
        name: { $regex: search, $options: "i" },
      }).limit(10);
      const playlist = await Playlist.find({
        name: { $regex: search, $options: "i" },
      }).limit(10);
      res.status(200).json({ data: { songs, playlist } });
    }
  })
);

module.exports = router;
