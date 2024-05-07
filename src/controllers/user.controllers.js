import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiArror.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinery } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, email, fullName, password } = req.body;

  // validetion - not empty
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fildes are required");
  }
  // check if user already exists: username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  // check for image, check for avatar
  const avatarLocalPath = req.files?.avatar[0].path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  // upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinery(avatarLocalPath);
  const coverImage = await uploadOnCloudinery(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar image is required");
  }
  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username,
    email,
    password,
  });
  // remove password and refresh token from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while creating user");
  }
  // check for user creation
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
  // return res
});

export { registerUser };
