import mongoose, { Schema } from "mongoose";
import { Post, Comment, Private } from "../types/types.ts";

const privateSchema: Schema<Private> = new Schema({
    privateSpaceId: {
        type: Schema.Types.ObjectId,
        ref: 'PrivateSpace'
    },
    channel: {
        type: String,
        enum: ["general", "governance", "announcement"]
    },
}, { _id: false })

const commentSchema: Schema<Comment> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { _id: false });

const postSchema: Schema<Post> = new Schema({
    post: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    repostBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    repostDescription: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Number,
        required: true
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    comments: {
        type: [commentSchema],
        default: []
    },
    type: {
        type: String,
        enum: ["created", "repost"],
        required: true
    },
    space: {
        type: String,
        enum: ["public", "private"],
        required: true
    },
    private: {
        type: privateSchema
    }
})

const postModel = mongoose.model<Post>("Post", postSchema);
export default postModel;