import { Request, Response, NextFunction } from "express";
import privateSpaceModel from "../models/privateSpaceModel.ts";
import { privateSpaceCreateBodyType, joinMemberBodyType } from "../types/privateSpaceTypes.ts";
import userModel from "../models/userModel.ts";

const error = new Error();

export const createPrivateSpace = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const privateSpaceCreateBody: privateSpaceCreateBodyType = req.body;

        if (!privateSpaceCreateBody.name || !privateSpaceCreateBody.createdBy || !privateSpaceCreateBody.entryCondition.address || !privateSpaceCreateBody.entryCondition.maxAmount || !privateSpaceCreateBody.interactCondition.address || !privateSpaceCreateBody.interactCondition.maxAmount) {
            error.message = "Missing required fields";
            (error as any).statusCode = 400;
            return next(error);
        }

        const userRegisterd = await userModel.findById({ _id: privateSpaceCreateBody.createdBy });
        if (!userRegisterd) {
            error.message = "User not registerd";
            (error as any).statusCode = 400;
            return next(error);
        }

        const privateSpaceCreate = await privateSpaceModel.create({
            name: privateSpaceCreateBody.name,
            createdBy: privateSpaceCreateBody.createdBy,
            entryCondition: privateSpaceCreateBody.entryCondition,
            interactCondition: privateSpaceCreateBody.interactCondition,
            channels: [
                { type: "general", posts: [] },
                { type: "governance", posts: [] },
                { type: "announcement", posts: [] }
            ]
        });
        return res.status(201).json({ message: "private space created successfully.", privateSpace: privateSpaceCreate })
    } catch (error) {
        next(error);
    }
}

export const joinPrivateSpace = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const joinMemberBody: joinMemberBodyType = req.body;
        if (!joinMemberBody.privateSpaceId || !joinMemberBody.userId) {
            error.message = "Missing required fields";
            (error as any).statusCode = 400;
            return next(error);
        }

        const privateSpaceFind = await privateSpaceModel.findById({ _id: joinMemberBody.privateSpaceId });
        if (!privateSpaceFind) {
            error.message = "private space not available";
            (error as any).statusCode = 400;
            return next(error);
        }

        const userRegisterd = await userModel.findById({ _id: joinMemberBody.userId });
        if (!userRegisterd) {
            error.message = "User not registerd";
            (error as any).statusCode = 400;
            return next(error);
        }

        const privateSpaceMemberUpdate = await privateSpaceModel.findByIdAndUpdate(
            { _id: joinMemberBody.privateSpaceId },
            { $addToSet: { members: joinMemberBody.userId } },
            { new: true }
        );

        if (!privateSpaceMemberUpdate) {
            error.message = "Failed to update private space";
            (error as any).statusCode = 400;
            return next(error);
        }

        return res.status(201).json({
            message: "user added successfully.",
            privateSpace: privateSpaceMemberUpdate
        });
    } catch (error) {
        next(error);
    }
}

export const getPrivateSpace = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const privateSpaceId = req.params.privateSpaceId;
        const privateSpaceFind = await privateSpaceModel.findById({ _id: privateSpaceId });

        if (!privateSpaceFind) {
            error.message = "private space not available";
            (error as any).statusCode = 400;
            return next(error);
        }

        return res.status(200).json({ privateSpace: privateSpaceFind });
    } catch (error) {
        next(error)
    }
}