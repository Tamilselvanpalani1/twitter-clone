import React from 'react';
import toast from "react-hot-toast"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { baseUrl } from '../constant/url';

// Custom hook for follow/unfollow logic
const useFollow = () => {
    const queryClient = useQueryClient();

    const { mutate: follow, isPending } = useMutation({
        
        // mutationFn runs when follow(userId) is called
        mutationFn: async (userId) => {
            try {
                // Call backend follow/unfollow API
                const res = await fetch(`${baseUrl}/api/users/follow/${userId}`, {
                    method: "POST",                   // GET request for toggling follow state
                    credentials: "include",          // send cookies (JWT)
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                const data = await res.json();

                // If backend returns non-200 status → throw error
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }

                return data; // returned to onSuccess()
            } catch (error) {
                throw error; // pass error to React Query's error handling
            }
        },

        // Triggered when follow/unfollow was successful
        onSuccess: () => {
             // Both follow and unfollow routes get handled same time
            Promise.all([
            // Refetch suggestedUsers UI (since follow state changes suggestions)
            queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
            // Refetch authUser to update their following list in UI
            queryClient.invalidateQueries({ queryKey: ["authUser"] }),
            ])
        },
        onError : (error) => {
            toast.error(error.message)
        }
    });

    // Expose follow() function + loading state
    return { follow, isPending };
};

export default useFollow;
