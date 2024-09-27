import { Document, Types } from "mongoose";

export interface Condition extends Document {
    address: string;
    maxAmount: number;
}

export interface Channels extends Document {
    type: "general" | "governance" | "announcement";
    posts: Types.ObjectId[];
}

export interface PrivateSpace extends Document {
    name: string;
    image: string;
    createdBy: Types.ObjectId;
    entryCondition: Condition;
    interactCondition: Condition;
    members: Types.ObjectId[];
    channels: Channels[];
}

export type privateSpaceCreateBodyType = {
    name: string;
    image: string;
    createdBy: Types.ObjectId;
    entryCondition: Condition;
    interactCondition: Condition;
}

export type joinMemberBodyType = {
    userId: Types.ObjectId;
    privateSpaceId: Types.ObjectId;
}