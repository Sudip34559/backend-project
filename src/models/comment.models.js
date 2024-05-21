import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentsSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
commentsSchema.plugin(mongooseAggregatePaginate);

export const Comments = mongoose.model("Comments", commentsSchema);
