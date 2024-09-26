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

type RequestQueryType = {
    space: "public" | "private",
    privateSpaceId: mongoose.Types.ObjectId | null;
    channel: "general" | "governance" | "announcement" | null;
}

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const requestQuery = req.query as unknown as RequestQueryType;
        console.log(requestQuery)

        let post = {};

        if (requestQuery.space === "public") {
            console.log("public");
            post = await fetchPublicPost(userId, requestQuery.space, null, null);
        } else {
            console.log("4tirutoirutoierutoprivate");
            post = await fetchPublicPost(userId, requestQuery.space, requestQuery.channel, requestQuery.privateSpaceId);
        }
        return res.status(200).json({ message: "GOOD", publicPost: (post as any).publicPost, followingPost: (post as any).followingPost });
    } catch (error) {
        next(error);
    }
}