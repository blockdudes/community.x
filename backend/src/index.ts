import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import postModel from "./models/postModel.ts";
import userModel from "./models/userModel.ts";
import { PostCreateBody, LikePostBody, CommentPostBody, FollowUserBody, RePostBody, Post } from "./types/types.ts";

import userRoutes from "./routes/userRoutes.ts";
import postRoutes from "./routes/postRoute.ts";
import privateSpaceRoute from "./routes/privateSpaceRoute.ts";
import { fetchPublicPost } from "./helper/helper.ts";

dotenv.config(); 3238

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api", [userRoutes, postRoutes, privateSpaceRoute]);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const status = (err as any).statusCode ? (err as any).statusCode : 500;
    res.status(status).json({
        message: err.message
    })
})

const mongooseURI = process.env.MONGO_DB_URL;
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    maxHttpBufferSize: 1e8
})

if (!mongooseURI) {
    console.error("MONGO_DB_URL is not defined in the environment variables");
    process.exit(1);
}

io.on("connection", (socket: Socket) => {
    console.log("user connected: ", socket.id);

    socket.on("join_space", (data) => {
        console.log(data);
        console.log(`User ${socket.id} joined ${data.space} space`);

        if (data.space === "public") {
            socket.join("public");
        } else {
            socket.join(`${data.privateSpaceId}_${data.channel}`);
        }
    });

    socket.on("create_post", async (data: PostCreateBody) => {
        try {
            const timestamp = Date.now();
            const createPost = await postModel.create({
                title: data.title,
                description: data.description,
                post: data.post,
                createdBy: data.createdBy,
                timestamp: timestamp,
                type: "created",
                space: data.space === "public" ? "public" : "private",
                private: data.space === "public" ? {} : {
                    privateSpaceId: data.privateSpaceId,
                    channel: data.channel
                }
            });

            if (createPost) {
                let getAllPost = {};

                if (data.space === "public") {
                    getAllPost = await fetchPublicPost(data.createdBy.toString(), data.space, null, null);
                    io.to("public").emit("fetch_post", getAllPost);
                } else {
                    getAllPost = await fetchPublicPost(data.createdBy.toString(), data.space, data.channel, data.privateSpaceId);
                    io.to(`${data.privateSpaceId}_${data.channel}`).emit("fetch_post", getAllPost);
                }
            }
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("post_like", async (data: LikePostBody) => {
        try {
            const updatedPost = await postModel.findOneAndUpdate(
                { _id: data._id },
                { $addToSet: { likes: data.likedBy } },
                { new: true }
            );

            if (updatedPost) {
                let getAllPost = {};

                if (data.space === "public") {
                    getAllPost = await fetchPublicPost(data.likedBy.toString(), data.space, null, null);
                    io.to("public").emit("fetch_post", getAllPost);
                } else {
                    getAllPost = await fetchPublicPost(data.likedBy.toString(), data.space, data.channel, data.privateSpaceId);
                    io.to(`${data.privateSpaceId}_${data.channel}`).emit("fetch_post", getAllPost);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("post_comment", async (data: CommentPostBody) => {
        try {
            const updatedPost = await postModel.findOneAndUpdate(
                { _id: data._id },
                { $addToSet: { comments: { user: data.commentBy, comment: data.comment } } },
                { new: true }
            );

            if (updatedPost) {
                let getAllPost = {};

                if (data.space === "public") {
                    getAllPost = await fetchPublicPost(data.commentBy.toString(), data.space, null, null);
                    io.to("public").emit("fetch_post", getAllPost);
                } else {
                    getAllPost = await fetchPublicPost(data.commentBy.toString(), data.space, data.channel, data.privateSpaceId);
                    io.to(`${data.privateSpaceId}_${data.channel}`).emit("fetch_post", getAllPost);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("post_repost", async (data: RePostBody) => {
        try {
            const post = await postModel.findById(data._id);
            if (post && post.createdBy !== data.repostBy) {
                const timestamp = Date.now();

                const createRepost = await postModel.create({
                    title: post.title,
                    description: post.description,
                    post: post.post,
                    createdBy: post.createdBy,
                    timestamp: timestamp,
                    repostBy: data.repostBy,
                    repostDescription: data.repostDescription,
                    type: "repost"
                });

                if (createRepost) {
                    let getAllPost = {};

                    if (data.space === "public") {
                        getAllPost = await fetchPublicPost(data.repostBy.toString(), data.space, null, null);
                        io.to("public").emit("fetch_post", getAllPost);
                    } else {
                        getAllPost = await fetchPublicPost(data.repostBy.toString(), data.space, data.channel, data.privateSpaceId);
                        io.to(`${data.privateSpaceId}_${data.channel}`).emit("fetch_post", getAllPost);
                    }
                }
            } else {
                console.log("User cannot repost their own post");
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("follow_user", async (data: FollowUserBody) => {
        try {
            const updateFollowingUser = await userModel.findByIdAndUpdate(
                { _id: data.userId },
                { $addToSet: { followings: data.followUserId } },
                { new: true }
            );

            const updateFollowerUser = await userModel.findByIdAndUpdate(
                { _id: data.followUserId },
                { $addToSet: { followers: data.userId } },
                { new: true }
            );

            if (updateFollowingUser && updateFollowerUser) {
                const user = await userModel.findById({ _id: data.userId })
                    .populate({
                        path: 'followers',
                        select: 'username description image address'
                    })
                    .populate({
                        path: 'followings',
                        select: 'username description image address'
                    });
                const users = await userModel.find()
                    .populate({
                        path: 'followers',
                        select: 'username description image address'
                    })
                    .populate({
                        path: 'followings',
                        select: 'username description image address'
                    });
                io.to("public").emit("public_user", { user, users });
            }
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("unfollow_user", async (data: FollowUserBody) => {
        try {
            const updateFollowingUser = await userModel.findByIdAndUpdate(
                { _id: data.userId },
                { $pull: { followings: data.followUserId } },
                { new: true }
            );

            const updateFollowerUser = await userModel.findByIdAndUpdate(
                { _id: data.followUserId },
                { $pull: { followers: data.userId } },
                { new: true }
            );

            if (updateFollowingUser && updateFollowerUser) {
                const user = await userModel.findById({ _id: data.userId })
                    .populate({
                        path: 'followers',
                        select: 'username description image address'
                    })
                    .populate({
                        path: 'followings',
                        select: 'username description image address'
                    });
                const users = await userModel.find()
                    .populate({
                        path: 'followers',
                        select: 'username description image address'
                    })
                    .populate({
                        path: 'followings',
                        select: 'username description image address'
                    });
                io.to("public").emit("public_user", { user, users });
            }
        } catch (error) {
            console.log(error);
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
})

mongoose.connect(mongooseURI).then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});
