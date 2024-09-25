import { Request, Response, NextFunction } from "express";
import postModel from "../models/postModel.ts";
import userModel from "../models/userModel.ts";
import { Post } from "../types/types.ts";
import { fetchPublicPost } from "../helper/helper.ts";
import mongoose from "mongoose";

export const getAllPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getAllPost = await postModel.find();
        return res.status(200).json({ posts: getAllPost });
    } catch (error) {
        next(error);
    }
}

type requestBodyType = {
    space: "public" | "private",
    privateSpaceId: mongoose.Types.ObjectId | null;
    channel: "general" | "governance" | "announcement" | null;
}

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const requestBody: requestBodyType = req.body;
        let post = {};

        if (requestBody.space === "public") {
            post = await fetchPublicPost(userId, requestBody.space, null, null);
        } else {
            post = await fetchPublicPost(userId, requestBody.space, requestBody.channel, requestBody.privateSpaceId);
        }
        return res.status(200).json({ message: "GOOD", publicPost: (post as any).publicPost, followingPost: (post as any).followingPost });
    } catch (error) {
        next(error);
    }
}