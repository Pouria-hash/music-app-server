const mongoose = require("mongoose");
const { Schema } = mongoose;
const Joi = require("joi");

const ObjectId = Schema.Types.ObjectId;

const playlistSchema = new Schema({
  name: { type: String, required: true },
  user: { type: ObjectId, ref: "User", required: true },
  desc: { type: String },
  songs: { type: Array, default: [] },
  image: { type: String, required: true },
});

const validatePlaylist = (playlist) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    user: Joi.string().required(),
    desc: Joi.string().allow(),
    songs: Joi.array().items(Joi.string()),
    image: Joi.string().required(),
  });

  return schema.validate(playlist);
};

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = { Playlist, validatePlaylist };
