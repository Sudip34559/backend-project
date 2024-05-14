import { Router } from "express";
import {
  changeCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getCurrentUser,
  updeteAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-current-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/update-account-details").post(verifyJWT, updeteAccountDetails);
router
  .route("/apdate-user-avavar")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    verifyJWT,
    updateUserAvatar
  );
router
  .route("/update-user-cover-image")
  .post(
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    verifyJWT,
    updateUserCoverImage
  );
export default router;
