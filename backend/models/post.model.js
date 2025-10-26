import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		user: { //who created the post
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: { //text content of the post
			type: String,
		},
		img: { //image URL of the post
			type: String,
		},
		likes: [ //users who liked the post
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [ //comments on the post
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;