import bcrypt from "bcryptjs"; // For password hashing (not used in this function)
import cloudinary from "cloudinary"; // For image uploads (not used here)

// models
// import Notification from "../models/notification.model.js"; // Can be used for future notification features
import User from "../models/user.model.js"; // Import User model
import Notification from "../models/notification.model.js"; // Import Notification model

// --------------------------------------------
// GET USER PROFILE CONTROLLER
// This controller fetches a user's public profile based on their username
// Route: GET /api/users/profile/:username
// Access: Private (protected by middleware)
// --------------------------------------------
export const getUserProfile = async (req, res) => {
	// Extract the username from URL parameters
	const { username } = req.params;

	try {
		// Find the user in the database by username
		// Exclude the password field from the result using .select("-password")
		const user = await User.findOne({ username }).select("-password");

		// If user not found, return 404 Not Found
		if (!user) return res.status(404).json({ message: "User not found" });

		// If user is found, send user data in the response
		res.status(200).json(user);
	} catch (error) {
		// If any error occurs during DB operation, log it and return 500 Internal Server Error
		console.log("Error in getUserProfile controller: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnFollowUser = async (req, res) => {
	try {
		const { id } = req.params; //getting the id of the user to be followed/unfollowed from the params
		const userToModify = await User.findById({ _id: id }); //checking whether the user to be followed/unfollowed exists in the MongoDB
		const currentUser = await User.findById({ _id: req.user._id }); //getting the logged in user from the protectRoute middleware

		if (id === req.user._id) {
			return res.status(400).json({ error: "You can't unfollow/follow yourself" });
		}

		if(!userToModify || !currentUser) {
			return res.status(404).json({ error: "User not found" });
		}

		const isFollowing = userToModify.followers.includes(id); //checking whether user is already followed or not

		if( isFollowing ) {
			//unfollow
			await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: req.user._id } }); 
			await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { following: id } });
			//send notification
			return res.status(200).json({ message: "User unfollowed successfully" });
		} 
		else{
			//follow
			await User.findByIdAndUpdate({ _id: id }, { $push: { followers: req.user._id } }); //Who all are following me
			await User.findByIdAndUpdate({ _id: req.user._id }, { $push: { following: id } }); //List of the users that I'm following
			//send notification
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id
			});	
			await newNotification.save();
			return res.status(200).json({ message: "User followed successfully" });
		}


	} catch (error) {
		console.log("Error in followUnFollowUser controller: ", error.message);
		res.status(500).json({ error: error.message });
	}
}

export const getSuggestedUser = async (req, res) => {
	try {
		const currentUser = req.user._id;
		const userFollowedByMe = await User.findById(currentUser).select("-password");
		const users = await User.aggregate([
			{ 
				$match: { 
					_id: { 
						$ne: currentUser // Getting suggested users except currentUser/me -> $ne means not equal
					} 
				} 
			},
			{ 
				$sample: { 
					size: 10 //suggested 10 users
				} 
			}, // Adjust the size as needed
		]);

		const filteredSuggestedUsers = users.filter((user) => 
			!userFollowedByMe.following.includes(user._id)
		); //filtering out the users that are already followed by me/current user

		const suggestedUsers = filteredSuggestedUsers.slice(0, 4); // getting only first 4 users from the filtered list
		suggestedUsers.forEach(user => { user.password = null }); //removing password from the suggested users list
		res.status(200).json(suggestedUsers);
		
	} catch (error) {
		console.log("Error in getSuggestedUser controller:", error);
		res.status(500).json({ error: error.message})
		
	}
}

export const updateUser = async (req, res) => {
	try {
		const userId = req.user._id; // Get the logged-in user's ID from the protectRoute middleware
		const { username, fullName, email, currentPassword, newPassword, bio, link } = req.body;
		let { profileImg, coverImg } = req.body; // Assuming images are sent as base64 strings or URLs
		let user = await User.findById(userId); // Fetch the user from the database

		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		if((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
			return res.status(400).json({ error: "Both current and new passwords are required to change password" });
		}

		if(currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if(!isMatch) {
				return res.status(400).json({ error: "Current password is incorrect" });
			}
			if(newPassword.length < 6) {
				return res.status(400).json({ error: "New password must be at least 6 characters long" });
			}
			const salt = await bcrypt.genSalt(10); // Generate salt for hashing
			const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash the new password
			user.password = hashedPassword; // Update the user's password
		}

		// if(profileImg) {
		// 	if(user.profileImg) {
		// 		// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
		// 		await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]); // Deleting old profile image from Cloudinary
		// 	}
		// 	const uploadedResponse = await cloudinary.uploader.upload(profileImg); // Upload profile image to Cloudinary
		// 	profileImg = uploadedResponse.secure_url; // Get the URL of the uploaded image and assign it back to profileImg(image string)
		// }
		// if(coverImg) {
		// 	if(user.coverImg) {
		// 		await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]); // Deleting old cover image from Cloudinary
		// 	}
		// 	const uploadedResponse = await cloudinary.uploader.upload(coverImg); // Upload cover image to Cloudinary
		// 	coverImg = uploadedResponse.secure_url; // Get the URL of the uploaded image and assign it back to coverImg(image string)
		// }

		user.fullName = fullName || user.fullName; // Update fullName from req.body if provided or keep existing fullName from DB
		user.email = email || user.email; // Update email from req.body if provided or keep existing email from DB
		user.username = username || user.username; // Update username from req.body if provided or keep existing username from DB
		user.bio = bio || user.bio; // Update bio from req.body if provided or keep existing bio from DB
		user.link = link || user.link; // Update link from req.body if provided or keep existing link from DB
		user.profileImg = profileImg || user.profileImg; // Update profileImg from req.body if provided or keep existing profileImg from DB
		user.coverImg = coverImg || user.coverImg; // Update coverImg from req.body if provided or keep existing coverImg from DB

		user = await user.save(); // Save the updated user to the database

		user.password = null; // Exclude password from the response

		return res.status(200).json(user); // Send the updated user data in the response

	} catch (error) {
		console.log("Error in updateUser controller:", error);
		res.status(500).json({ error: error.message});
	}
}