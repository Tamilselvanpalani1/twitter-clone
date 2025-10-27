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
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }); // Remove postId from user's likedPosts array
            res.status(200).json({ message: "Post unliked successfully" });
        }
        else{
            // Like the post
            post.likes.push(userId); // Add userId to likes array
            // await Post.updateOne({ _id: postId }, { $push: { likes: userId } }); // Add userId to likes array
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }); // Add postId to user's likedPosts array
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

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user", //populate user details
            select: "-password" // Exclude password field
        })
        .populate({
            path: "comments.user", //populate user details in comments
            select: ["-password"] // Exclude password and email fields
        }) // Fetch all posts from the database, sorted by creation date (newest first) and populate user details

        if(posts.length === 0) {
            return res.status(200).json([]); // Return empty array if no posts found
        }
        res.status(200).json(posts); // Return the list of posts

    } catch (error) {
        console.log('Error in get all posts controller:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = await req.params.id; // Get the user ID from the request parameters

        const user = await User.findById({ _id: userId });
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // Find posts where _id is in the user's likedPosts array
            .populate({
                path: "user", // Populate user details
                select: "-password" // Exclude password field
            })
            .populate({
                path: "comments.user", // Populate user details in comments
                select: ["-password"] // Exclude password and email fields
            })

    } catch (error) {
        console.log('Error in get liked posts controller:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getFollowingUsersPosts = async (req, res) => {
    try {
        const userId = req.user._id; // Get the logged-in user's ID from the protectRoute middleware
        const user = await User.findById({ _id: userId }); // Fetch the user from the database
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following; // Get the list of user IDs that the current user is following
        const feedPosts = await Post.find({ user: { $in: following } }) // Find posts from other users that the current user is following
            .sort({ createdAt: -1 }) // Sort posts by creation date (newest first)
            .populate({
                path: "user", // Populate user details
                select: "-password" // Exclude password field
            })
            .populate({
                path: "comments.user", // Populate user details in comments
                select: ["-password"] // Exclude password and email fields
            })
        res.status(200).json(feedPosts); // Return the list of posts from followed users

    } catch (error) {
        console.log('Error in get following posts controller:', error);
        res.status(500).json({ error: error.message });        
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params; // Get the username from the request parameters
        const user = await User.findOne({ username: username });
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ user: user._id }) // Find posts created by the specified user
            .sort({ createdAt: -1 }) // Sort posts by creation date (newest first)
            .populate({
                path: "user", // Populate user details
                select: "-password" // Exclude password field
            })
            .populate({
                path: "comments.user", // Populate user details in comments
                select: ["-password"] // Exclude password and email fields
            })
        res.status(200).json(posts); // Return the list of posts created by the specified user

    } catch (error) {
        console.log('Error in get user posts controller:', error);
        res.status(500).json({ error: error.message });
    }
}
