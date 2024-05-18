import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/videos.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinery } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Title and description must be provided");
  }
  console.log(req.files);

  const videoFilePath = req.files?.videoFile[0].path;
  const thumbnailPath = req.files?.thumbnail[0].path;
  console.log(videoFilePath, thumbnailPath);

  if (!videoFilePath || !thumbnailPath) {
    throw new ApiError(400, "vedio and thumbnail must be provided");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const videoFile = await uploadOnCloudinery(videoFilePath);
  const thumbnail = await uploadOnCloudinery(thumbnailPath);
  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Error while uploading video");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    title,
    description,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    duration: videoFile.duration,
  });
  return res
    .status(200)
    .json(new ApiResponse(201, video, "video uploded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "VideoId fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // console.log(videoId);
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  const { newTitle, newDescription } = req.body;
  await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: newTitle,
        description: newDescription,
      },
    },
    { new: true }
  );
  const newThumbnailFilePath = req.file?.path;
  if (!newThumbnailFilePath) {
    throw new ApiError(400, "Thumbnail is missing");
  }
  const video = await Video.findById(videoId);
  // console.log(video);
  const previousThumbnailPath = await video.thumbnail;
  // console.log(previousThumbnailPath);
  const imagePublicId = previousThumbnailPath.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(imagePublicId);

  const newThumbnail = await uploadOnCloudinery(newThumbnailFilePath);
  if (!newThumbnail.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }
  await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: newThumbnail.url,
      },
    },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, "video details updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  const video = await Video.findByIdAndDelete(videoId);

  console.log(video);
  const previousThumbnailPath = await video.thumbnail;
  const previousVideoPath = await video.videoFile;
  // console.log(previousThumbnailPath);
  const imagePublicId = previousThumbnailPath.split("/").pop().split(".")[0];
  const videoPublicId = previousVideoPath.split("/").pop().split(".")[0];

  console.log(imagePublicId, videoPublicId);
  await cloudinary.uploader.destroy(imagePublicId);
  await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });

  return res.status(200).json(new ApiResponse(200, "video deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video does not exist");
  }
  const isPublished = video.isPublished;
  await Video.findByIdAndUpdate(videoId, {
    $set: {
      isPublished: !isPublished,
    },
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, `${isPublished ? "unpublished" : "published"}`)
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
