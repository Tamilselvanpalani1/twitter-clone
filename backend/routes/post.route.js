import express from'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, getAllPosts, getLikedPosts, likeUnlikePost, getFollowingUsersPosts, getUserPosts, createComment, deleteComment, deletePost } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', protectRoute, getAllPosts); // Get all posts
router.get('/likes/:id', protectRoute, getLikedPosts); // Get liked posts
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.get('/following', protectRoute, getFollowingUsersPosts); // Get posts from followed users
router.get('/user/:username', protectRoute, getUserPosts); // Get all posts by a specific user
router.post('/comment/:id', protectRoute, createComment);
router.delete('/comment/:postId/:commentId', protectRoute, deleteComment); // Delete Comment
router.delete('/:id', protectRoute, deletePost);

// @route   POST /api/posts
export default router;