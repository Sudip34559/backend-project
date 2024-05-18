import mongoose, { isValidObjectId } from "mongoose";
import { Playlists } from "../models/playlist.models.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/videos.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, " name and description are required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const playlist = await Playlists.create({
    name,
    description,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(201, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User Id is missing");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const playlists = await Playlists.find({ owner: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is missing");
  }
  const playlist = await Playlists.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is missing");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  // Find the playlist by ID
  const playlist = await Playlists.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  // Find the video by ID
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  playlist.videos.push(videoId);
  console.log(playlist.videos);
  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist.videos, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is missing");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id is missing");
  }
  // Find the playlist by ID
  const playlist = await Playlists.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  // Find the video by ID
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  playlist.videos.pull(videoId);
  console.log(playlist.videos);

  await playlist.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist.videos,
        `${
          playlist.videos.length == 0
            ? "No more video are present"
            : "video removed successfully"
        }`
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is missing");
  }
  const playlist = await Playlists.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is missing");
  }
  if (!name || !description) {
    throw new ApiError(400, "name and description are required");
  }
  const playlist = await Playlists.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, "Playlist updated"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
