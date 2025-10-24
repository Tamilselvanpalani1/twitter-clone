import { generateTokenAndSetCookie } from "../Utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ----------------------------
// SIGNUP CONTROLLER
// ----------------------------
export const signup = async (req, res) => {
	try {
		// Destructure user input from request body
		const { fullName, username, email, password } = req.body;

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if username is already taken
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		// Check if email is already registered
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		// Hash the password using bcrypt
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create a new user instance
		const newUser = new User({
			fullName,
			username: username,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			// Generate JWT token and set it as an HTTP-only cookie
			generateTokenAndSetCookie(newUser._id, res);

			// Save the new user to the database
			await newUser.save();

			// Respond with user info (excluding password)
			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			// This block will rarely be reached unless Mongoose fails silently
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// ----------------------------
// LOGIN CONTROLLER
// ----------------------------
export const login = async (req, res) => {
	try {
		// Destructure credentials from request body
		const { username, password } = req.body;

		// Find user by username
		const user = await User.findOne({ username });

		// Compare provided password with stored hashed password
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		// If user doesn't exist or password doesn't match
		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// Generate JWT token and set it as an HTTP-only cookie
		generateTokenAndSetCookie(user._id, res);

		// Respond with user data (excluding password)
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// ----------------------------
// LOGOUT CONTROLLER
// ----------------------------
export const logout = async (req, res) => {
	try {
		// Clear the JWT cookie by setting it with an expired maxAge
		res.cookie("jwt", "", { maxAge: 0 });

		// Send confirmation response
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// ----------------------------
// GET CURRENT USER PROFILE
// (Used after protectRoute middleware)
// ----------------------------
export const getMe = async (req, res) => {
	try {
		// Use the user ID from protectRoute middleware (req.user._id)
		const user = await User.findById(req.user._id).select("-password");

		// Respond with user profile
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
