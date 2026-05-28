import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserById,
  sendFriendRequest,
  uploadProfileAvatar,
  updateMyProfile,
} from "../controllers/user.controller.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.patch("/me", updateMyProfile);
router.post("/me/avatar", uploadAvatar.single("avatar"), uploadProfileAvatar);
router.get("/:id", getUserById);

export default router;
