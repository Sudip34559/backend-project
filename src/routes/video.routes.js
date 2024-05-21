import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  deleteVideo,
  getVideoById,
  publishAVideo,
  updateVideo,
  togglePublishStatus,
  getAllVideos,
} from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllVideos);
router.route("/video-upload").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);
router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);
router.route("/:videoId");
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
