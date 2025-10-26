import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: { //unique username for the user
			type: String,
			required: true,
			unique: true,
		},
		fullName: { //full name of the user
			type: String,
			required: true,
		},
		password: { //password for the user account
			type: String,
			required: true,
			minLength: 6,
		},
		email: { //unique email for the user
			type: String,
			required: true,
			unique: true,
		},
		followers: [ //Who all are following me
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		following: [ //List of the users that I'm following
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		profileImg: { //profile image of the user
			type: String,
			default: "",
		},
		coverImg: { //cover image of the user
			type: String,
			default: "",
		},
		bio: { //bio of the user
			type: String,
			default: "",
		},

		link: { //personal website link of the user
			type: String,
			default: "",
		},
		likedPosts: [ //Posts liked by the user
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;