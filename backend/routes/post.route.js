import express from'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, createComment, deleteComment, deletePost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', protectRoute, createPost);
// router.post('/like/:id', protectRoute, likeUnlikePost);
router.post('/comment/:id', protectRoute, createComment);
router.delete('/comment/:postId/:commentId', protectRoute, deleteComment); // Delete Comment
router.delete('/:id', protectRoute, deletePost);

// @route   POST /api/posts
export default router;