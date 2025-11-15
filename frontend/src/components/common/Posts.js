import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { baseUrl } from '../../constant/url.js';
import { useQuery } from '@tanstack/react-query'
import { useEffect } from "react";

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
	const {data :posts, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json"
					}
				})

				const data = await res.json()
				if(!res.ok) throw new Error(data.error || "Something went wrong")
				return data;
			} catch (error) {
				throw error
			}
		}
	})

	//
	useEffect(() => {
		refetch();
	}, [feedType, refetch])
	
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{/* {console.log("Posts Length", posts.length)} */}
			
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};

export default Posts;