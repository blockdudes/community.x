"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchProposalsThunk } from "./contractSlice";

type Comment = {
    user: Object;
    comment: string;
}

type Post = {
    post: string;
    title: string;
    description: string;
    createdBy: string;
    repostBy: string;
    repostDescription: string;
    timestamp: number;
    likes: string[];
    comments: Comment[];
    type: "created" | "repost";
}

type intialPostStateType = {
    posts: Post[] | null;
    error: string | null;
    loading: boolean;
}

const intialPostState: intialPostStateType = {
    posts: null,
    error: null,
    loading: false
}

// useEffect(() => {
//     const fetchGovernanceProposals = async () => {
//       if (channel === 'governance') {
//       }
//     };
//     fetchGovernanceProposals();
//   }, [selectedSpaceId, selectedChannel, account]);



export const fetchAllPost = createAsyncThunk<
    { posts: Post[] },
    { space: string; privateSpaceId: string | null; channel: string | null, userId: string } | any,
    { rejectValue: string }
>("fetch_post", async (data, { rejectWithValue }) => {
    try {
        let post: any;
        if (!('userId' in data) || data.userId === undefined) {
            post = data;
        } else {
            const { userId, ...fetchPostData } = data;
            post = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/post/get/all/${userId}`, { params: fetchPostData })).data;
        }

        const unFollowingPost = [];
        const followingPost = [];
        for (const p of post?.publicPost) {
            if (p.timestamp) {
                unFollowingPost.push(p);
            }
        }
        unFollowingPost.sort((a, b) => b.timestamp - a.timestamp);

        for (const p of post?.followingPost) {
            if (p.timestamp) {
                followingPost.push(p);
            }
        }
        followingPost.sort((a, b) => b.timestamp - a.timestamp);
        const allPost = [...unFollowingPost.slice(0, 60), ...followingPost.slice(0, 40)]
        allPost.sort((a, b) => b.timestamp - a.timestamp);
        console.log(allPost, )
        return { posts: allPost }
    } catch (error) {
        return rejectWithValue(error as string);
    }
})

const fetchAllPostSlice = createSlice({
    name: "Post Slice",
    initialState: intialPostState,
    extraReducers: builder => {
        const updateState = (state: intialPostStateType, posts: Post[] | null, error: string | null, loading: boolean) => {
            state.posts = posts;
            state.error = error;
            state.loading = loading;
        }
        builder
            .addCase(fetchAllPost.pending, (state) => updateState(state, null, null, true))
            .addCase(fetchAllPost.fulfilled, (state, action) => updateState(state, action.payload?.posts ?? null, null, false))
            .addCase(fetchAllPost.rejected, (state, action) => updateState(state, null, action.payload as string, false))
    },
    reducers: {}
})

export default fetchAllPostSlice.reducer;