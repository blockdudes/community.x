import { Post } from "../types/types.ts";
import postModel from "../models/postModel.ts";
import userModel from "../models/userModel.ts";
import mongoose from "mongoose";

export const fetchPublicPost = async (userId: string, space: string, channel: string | null, privateSpaceId: mongoose.Types.ObjectId | null): Promise<{ publicPost: Post[], followingPost: Post[] }> => {
    try {
        const postsFind = await postModel.find()
            .populate('createdBy', 'username description image address')
            .populate('repostBy', 'username description image address')
            .populate({
                path: 'likes',
                select: 'username description image address'
            })
            .populate({
                path: 'comments.user',
                select: 'username description image address'
            })
            .exec();

        let posts: Post[] = [];

        if (space === "public") {
            posts = postsFind.filter(post => post.space === "public");
        } else {
            if (channel !== null && privateSpaceId !== null) {
                posts = postsFind.filter(post => post.space === "private" && post.private.channel === channel && post.private.privateSpaceId === privateSpaceId);
            }
        }

        const getUser = await userModel.findById({ _id: userId })
            .populate('followings', "address");

        let followingPost: Post[] = [];
        let publicPost: Post[] = [];

        if (getUser) {
            for (let following of getUser.followings) {
                const postByFollowing = posts.filter(post => (post.type === "created" && post.createdBy._id.equals(following._id)) || (post.repostBy !== null && post.repostBy._id.equals(following._id)));
                followingPost.push(...postByFollowing);
            }

            for (let post of posts) {
                let isPresent: boolean = false;
                for (let fpost of followingPost) {
                    if (fpost._id === post._id) {
                        isPresent = true;
                    }
                }
                if (!isPresent) {
                    publicPost.push(post);
                } else {
                    isPresent = false;
                }
            }
        }
        return { publicPost, followingPost };
    } catch (error) {
        return { publicPost: [], followingPost: [] };
    }
}