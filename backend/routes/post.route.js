import express from'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, getAllPosts, getLikedPosts, likeUnlikePost, createComment, deleteComment, deletePost } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', protectRoute, getAllPosts); // Get all posts
router.get('/like/:id', protectRoute, getLikedPosts); // Get liked posts
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.post('/comment/:id', protectRoute, createComment);
router.delete('/comment/:postId/:commentId', protectRoute, deleteComment); // Delete Comment
router.delete('/:id', protectRoute, deletePost);

// @route   POST /api/posts
export default router;