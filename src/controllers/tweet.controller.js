import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/apiArror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User Id is missing");
  }
  const tweets = await Tweet.find({ owner: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet Id is missing");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  tweet.content = content;
  await tweet.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet Id is missing");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
