import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import cloudinary from 'cloudinary';

// Create Post
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString(); // Get the logged-in user's ID from the protectRoute middleware

        const user = await User.findOne({ _id: userId });
        if(!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if(!text && !img) {
            return res.status(400).json({ error: "Post must have text or image" });
        }

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img); // Upload image to Cloudinary
            img = uploadedResponse.secure_url; // Get the URL of the uploaded image and assign it back to img(image string)
        }

        const newPost = new Post({
            user: userId,
            text: text,
            img: img
        }); // Create a new post instance

        await newPost.save(); // Save the new post to the database
        res.status(201).json({ message: "Post created successfully", post: newPost });

    } catch (error) {
        console.log('Error in create post controller:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete Post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params; // Get the post ID from the request parameters

        const post = await Post.findOne({ _id: id  });
        if(!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        if(post.img) {
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId); // Deleting post image from Cloudinary
        }
        await Post.findByIdAndDelete({ _id: id }); // Delete the post from the database
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log('Error in delete post controller:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create Comment
export const createComment = async (req, res) => {
    try {
        const { text } = req.body; // Get comment text from the request body
        const postId = req.params.id; // Get the post ID from the request parameters
        const userId = req.user._id; // Get the logged-in user's ID from the protectRoute middleware

        if(!text) {
            return res.status(400).json({ error: "Comment text is required" });
        }

        const post = await Post.findOne({ _id: postId });
        if(!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const Comment = {
            text: text, // Comment text
            user: userId // Reference to the User model
        };

        post.comments.push(Comment); // Add the comment to the post's comments array in the post model
        await post.save();
        res.status(201).json(post); // Return the updated post with the new comment

        const newNotification = new Notification({ // Create notification for comment
            type: "comment",
            from: userId,
            to: post.user,
            post: postId
        });
        await newNotification.save(); // Save notification for the post owner

    } catch (error) {
        console.log('Error in create comment controller:', error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params; // Get the post ID and comment ID from the request parameters
        const userId = req.user._id; // Get the logged-in user's ID from the protectRoute middleware

        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId); // Find the comment by its ID
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user.toString() !== userId.toString()) { // Check if the logged-in user is the owner of the comment
            return res.status(401).json({ error: "You are not authorized to delete this comment" });
        }

        post.comments = post.comments.filter( comment => comment._id.toString() !== commentId );
        await post.save(); // Save the updated post without the deleted comment
        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.log('Error in delete comment controller:', error);
        res.status(500).json({ error: error.message });
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findOne({ _id: postId });
        if(!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost) {
            // Unlike the post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); // Remove userId from likes array
            res.status(200).json({ message: "Post unliked successfully" });
        }
        else{
            // Like the post
            post.likes.push(userId); // Add userId to likes array
            // await Post.updateOne({ _id: postId }, { $push: { likes: userId } }); // Add userId to likes array
            await post.save();

            // Create notification for like
            const newNotification = new Notification({
                type: "like",
                from: userId,
                to: post.user, // Notify the post owner
                post: postId
            });
            await newNotification.save(); // Save notification for the post owner

            res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (error) {
        console.log('Error in like/unlike post controller:', error);
        res.status(500).json({ error: error.message });
    }
}
