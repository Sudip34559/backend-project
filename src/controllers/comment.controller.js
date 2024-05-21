import mongoose from "mongoose";
import { Comments } from "../models/comment.models.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const comments = await Comments.find({ video: videoId })
    .limit(limitNumber)
    .skip(skip);
  const allComments = await Comments.find({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: comments,
        totalPages: Math.ceil(allComments.length / limitNumber),
        currentPage: pageNumber,
        totalComments: allComments.length,
      },
      "comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // console.log(videoId);
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  const { content } = req.body;
  // console.log(content);
  if (!content) {
    throw new ApiError(400, "Content is missing");
  }
  const user = await User.findById(req.user._id);
  // console.log(user);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const comment = await Comments.create({
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
  console.log(newContent);
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
  const comment = await Comments.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newContent,
      },
    },
    { new: true }
  );
  if (!comment) {
    throw new ApiError(400, "Comment does not exist");
  }
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
  const comment = await Comments.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment does not exist");
  }
  await Comments.findByIdAndDelete(commentId);
  return res.status(200).json(new ApiResponse(200, "Comment is deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
