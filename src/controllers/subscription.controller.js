import mongoose, { isValidObjectId } from "mongoose";
import { ObjectId } from "mongodb";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is missing");
  }
  const userId = new ObjectId(req.user?._id);
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel is missing");
  }
  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });
  if (subscription) {
    await Subscription.deleteOne({
      subscriber: userId,
      channel: channelId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isSubscribed: false }, "Subscription deleted")
      );
  }
  const subscriber = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriber, isSubscribed: true },
        "Subscription created"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is missing");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel does not exist");
  }
  const subscribers = (await Subscription.find({ channel: channelId })).map(
    (s) => s.subscriber
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers || 0, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Subscriber Id is missing");
  }
  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(400, "Subscriber does not exist");
  }

  const channels = (await Subscription.find({ subscriber: subscriberId })).map(
    (c) => c.channel
  );
  console.log(channels);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channels || null, "Channels fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
