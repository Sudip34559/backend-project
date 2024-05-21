import mongoose, { isValidObjectId } from "mongoose";
import { ObjectId } from "mongodb";
import { Video } from "../models/videos.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/apiArror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelId = new ObjectId(req.user?._id);

  const videos = (await Video.find({ owner: channelId })).length || 0;
  const subscriptions =
    (await Subscription.find({ channel: channelId })).length || 0;
  const likes = (await Like.find({ owner: channelId }).length) || 0;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, subscriptions, likes },
        "stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const channelId = new ObjectId(req.user?._id);
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is missing");
  }

  const videos = await Video.find({ owner: channelId });
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
