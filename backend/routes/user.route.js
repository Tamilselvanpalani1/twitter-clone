import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUserProfile, followUnFollowUser, getSuggestedUser, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.get("/suggested", protectRoute, getSuggestedUser);
router.post("/update", protectRoute, updateUser); // Future implementation for updating user profile

export default router;