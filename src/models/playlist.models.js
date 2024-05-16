import mongoose, { Schema } from "mongoose";

const playlistshema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timeseries: true }
);

export const Playlists = mongoose.model("Playlists", playlistshema);
