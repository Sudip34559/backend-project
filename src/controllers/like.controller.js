import mongoose, { isValidObjectId, trusted } from "mongoose";
import { ObjectId } from "mongodb";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/videos.models.js";
import { Comments } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video is missing");
  }
  const userId = new ObjectId(req.user?._id);

  const likedVideo = await Like.findOne({ video: videoId, likedBy: userId });
  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);
    await User.findByIdAndUpdate(req.user?._id, {
      $pull: {
        likedVideos: videoId,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isliked: false }, "Video unliked"));
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  const likes = await Like.find({ video: videoId });
  const video = await Video.findById(videoId);
  video.likes = likes.length;
  await video.save({ validateBeforeSave: false });
  const user = await User.findById(req.user?._id);
  user.likedVideos.push(videoId);
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like: like, isliked: true },
        "Video liked successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment is missing");
  }
  const userId = new ObjectId(req.user?._id);
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    // If the user has already liked the comment, unlike it
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isliked: false }, "Comment unliked successfully")
      );
  }
  // If the user has not liked the comment, like it
  const like = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });
  const likes = await Like.find({ comment: commentId });
  const comment = await Comments.findById(commentId);
  comment.likes = likes.length;
  await comment.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like: like, isliked: true },
        "Comment liked successfully"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet is missing");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }
  const userId = new ObjectId(req.user?._id);
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });
  if (existingLike) {
    // If the user has already liked the tweet, unlike it
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isliked: false }, "Tweet unliked successfully")
      );
  }
  // If the user has not liked the tweet, like it
  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  const likes = await Like.find({ tweet: tweetId });
  tweet.likes = likes.length;
  await tweet.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like: like, isliked: true },
        "Tweet liked successfully"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User Id is missing");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const likedVideos = await Video.find({
    _id: { $in: user.likedVideos },
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
