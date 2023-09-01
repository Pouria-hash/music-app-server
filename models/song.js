const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const songSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    artist: {
      type: String,
      required: true,
    },
    song: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const validateSong = (song) => {
  const Schema = Joi.object({
    title: Joi.string().required(),
    artist: Joi.string().required(),
    song: Joi.string().required(),
    image: Joi.string().required(),
    duration: Joi.string().required(),
  });
  return Schema.validate(song);
};

const Song = mongoose.model("Song", songSchema);

module.exports = { Song, validateSong };
