import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is missing");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  if (!newContent) {
    throw new ApiError(400, "Content is missing");
  }
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Comment Id is missing");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newContent,
      },
    },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, "Comment is updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Comment Id is missing");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment does not exist");
  }
  await Comment.findByIdAndDelete(commentId);
  return res.status(200).json(new ApiResponse(200, "Comment is deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
