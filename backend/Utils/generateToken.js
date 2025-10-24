import jwt from "jsonwebtoken"; // Import JWT for creating signed tokens

// ------------------------------------------------------------------
// GENERATE JWT AND SET AS COOKIE
// This function creates a signed JWT for a user and sends it as a
// secure HTTP-only cookie in the response.
// Used after successful login or signup.
// ------------------------------------------------------------------
export const generateTokenAndSetCookie = (userId, res) => {
	// Step 1: Generate JWT token with payload containing userId
	const token = jwt.sign(
		{ userId }, // payload
		process.env.JWT_SECRET, // secret key for signing (keep it safe!)
		{
			expiresIn: "15d", // token will expire in 15 days
		}
	);

	// Step 2: Set the JWT as an HTTP-only cookie
	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // Cookie expiry in milliseconds (15 days)
		httpOnly: true, // Prevents client-side JS from accessing the cookie (protects against XSS)
		sameSite: "strict", // Only send cookie for same-site requests (helps prevent CSRF)
		secure: process.env.NODE_ENV !== "development", // Only send cookie over HTTPS in production
	});
};
