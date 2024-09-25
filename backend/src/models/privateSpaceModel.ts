import mongoose, { Schema } from "mongoose";
import { PrivateSpace, Condition, Channels } from "../types/privateSpaceTypes.ts";

const channelsSchema: Schema<Channels> = new Schema({
    type: {
        type: String,
        enum: ["general", "governance", "announcement"],
        required: true
    },
    posts: {
        type: [Schema.Types.ObjectId],
        ref: 'Post',
        default: []
    },
}, { _id: false })

const conditionSchema: Schema<Condition> = new Schema({
    address: {
        type: String,
        required: true,
    },
    maxAmount: {
        type: Number,
        required: true
    }
}, { _id: false });

const privateSpaceSchema: Schema<PrivateSpace> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    entryCondition: {
        type: conditionSchema,
        required: true
    },
    interactCondition: {
        type: conditionSchema,
        required: true
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    channels: {
        type: [channelsSchema],
        required: true
    }
})

const privateSpaceModel = mongoose.model<PrivateSpace>("PrivateSpace", privateSpaceSchema);
export default privateSpaceModel;