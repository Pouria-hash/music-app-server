const router = require("express").Router();
const { User } = require("../models/user");
const { Playlist, validatePlaylist } = require("../models/playlist");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { isAdmin, validObjectId, auth } = require("../utils/middleware");
const Joi = require("joi");
const { Song } = require("../models/song");

// get all playlist
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const playlists = await Playlist.find({});
    if (playlists.length > 0) {
      return res.status(200).json({ data: playlists });
    }
    throw new ExpressError("No playlist found", 404);
  })
);

// create playlist
router.post(
  "/",
  auth,
  wrapAsync(async (req, res) => {
    const { error } = validatePlaylist(req.body);
    if (error) throw new ExpressError("not valid data", 403);

    const user = await User.findById(req.user._id);

    const playlistData = req.body;
    const playlist = await Song({ ...playlistData, user: user._id }).save();

    user.playlist.push(playlist);
    await user.save();

    res
      .status(202)
      .json({ data: playlist, message: "Playlist created successfully" });
  })
);

// update playlist
router.put(
  "/:id",
  validObjectId,
  auth,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);

    if (!playlist) throw new ExpressError("Playlist not found", 404);

    const user = await User.findById(req.user._id);
    if (!user._id.equals(playlist.user))
      throw new ExpressError("User do not have access to palylist");

    playlist.name = req.body.name;
    playlist.description = req.body.description;
    playlist.image = req.body.image;
    await playlist.save();

    res.status(202).json({ message: "playlist updated successfully" });
  })
);

// add song to playlist
router.put(
  "/add_song",
  auth,
  wrapAsync(async (req, res) => {
    const schema = Joi.object({
      playlistId: Joi.string().required(),
      songId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) throw new ExpressError(error.details[0].message, 404);

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);

    if (!playlist) throw new ExpressError("Playlist not found", 404);

    if (!user._id.equals(playlist.user))
      throw new ExpressError("User do not have access to palylist");

    if (playlist.songs.indexOf(req.body.songId) === -1) {
      playlist.songs.push(req.body.songId);
    }
    await playlist.save();
    res.status(200).json({ message: "Added to playlist" });
  })
);

// remove song from playlist
router.put(
  "/remove_song",
  auth,
  wrapAsync(async (req, res) => {
    const schema = Joi.object({
      playlistId: Joi.string().required(),
      songId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) throw new ExpressError(error.details[0].message, 404);

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);

    if (!playlist) throw new ExpressError("Playlist not found", 404);

    if (!user._id.equals(playlist.user))
      throw new ExpressError("User do not have access to palylist");

    const songIndex = playlist.songs.indexOf(req.body.songId);
    playlist.songs.splice(songIndex, 1);
    await playlist.save();

    res.status(200).json({ message: "deleted from playlist" });
  })
);

//user favorite playlist
router.get(
  "/you/favorite",
  auth,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const playlists = await Playlist.find({ _id: user.playlists });

    res.status(200).json({ data: playlists });
  })
);

//get random playlists
router.get(
  "/random",
  auth,
  wrapAsync(async (req, res) => {
    const playlists = await Playlist.aggregate([{ $sample: { size: 10 } }]);

    res.status(200).json({ data: playlists });
  })
);

//get playlist by id and songs
router.get(
  "/:id",
  validObjectId,
  auth,
  wrapAsync(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) throw new ExpressError("No playlist found", 404);

    const songs = await Song.find({ _id: playlist.songs });
    res.status(200).json({ data: { playlists, songs } });
  })
);

// delete playlist
router.delete(
  "/:id",
  validObjectId,
  auth,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) throw new ExpressError("No playlist found", 404);

    if (!user._id.equals(playlist.user))
      throw new ExpressError("User do not have access to palylist", 403);

    const index = user.playlist.indexOf(req.params.id);
    user.playlist.splice(index, 1);
    await user.sava();
    await playlist.save();

    res.status(200).json({ message: "Removed from library" });
  })
);

module.exports = router;
