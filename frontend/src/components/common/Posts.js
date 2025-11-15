import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { baseUrl } from '../../constant/url.js';
import { useQuery } from '@tanstack/react-query'

const Posts = ({feedType}) => {
	// const isLoading = false;

	const getPostEndPoint = () => {
		// Tab type	
		switch (feedType) {
			case "forYou":
				return `${baseUrl}/api/posts/all`;
			case "following":
				return `${baseUrl}/api/posts/following`;
			default:
				return `${baseUrl}/api/posts/all`;
		}
	}

	const POST_ENDPOINT = getPostEndPoint();
	// console.log("POST EndPoint", POST_ENDPOINT);
	const {data, isLoading} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					credentials: "includes",
					headers: {
						"Content-Type": "application/json"
					}
				})
			} catch (error) {
				
			}
		}
	})
	
	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && POSTS && (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};

export default Posts;