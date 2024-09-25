import mongoose, { Document, Schema, Types } from "mongoose";

export interface User extends Document {
    username: string;
    description: string;
    image: string;
    address: string;
    followers: Types.ObjectId[];
    followings: Types.ObjectId[];
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
        unique: true
    },
    followers: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    followings: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }
})

const userModel = mongoose.model<User>("User", userSchema);
export default userModel;