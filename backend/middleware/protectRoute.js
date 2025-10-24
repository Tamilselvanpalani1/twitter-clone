import User from "../models/user.model.js"; // Import the User model to query the database
import jwt from "jsonwebtoken"; // Import JWT to verify the token

// ---------------------------------------------
// PROTECT ROUTE MIDDLEWARE
// Purpose: Middleware to protect private routes
// It checks for a valid JWT in the user's cookies,
// verifies the token, fetches the user from DB,
// and attaches the user to the request object.
// ---------------------------------------------
export const protectRoute = async (req, res, next) => {
	try {
		// Step 1: Retrieve JWT token from cookies
		const token = req.cookies.jwt;

		// If no token found, block access
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

		// Step 2: Verify token using the secret key
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("Decoded token:", decoded); // Log decoded token (for debugging)

		// If token is somehow invalid after decoding (very rare), block access
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

		// Step 3: Use the userId from the token payload to fetch user from DB
		const user = await User.findById(decoded.userId).select("-password"); // Exclude password field
		console.log("User fetched from DB:", user); // Log user (for debugging)

		// If user no longer exists (deleted or ID is invalid), block access
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Step 4: Attach user object to request, so downstream controllers can use it
		req.user = user;

		// Step 5: Allow request to proceed to the next middleware or controller
		next();
	} catch (err) {
		// Catch and log any unexpected errors (token expired, DB issues, etc.)
		console.log("Error in protectRoute middleware", err.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
