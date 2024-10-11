import userModel from "../models/userModel.ts";
import { Request, Response, NextFunction } from "express";
import { UserRegisterBody } from "../types/types.ts";

const error = new Error();

export const userRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as UserRegisterBody;
        const { name, username, description, image, address } = body;

        if (!name || !username || !description || !image || !address) {
            error.message = "Missing required fields";
            (error as any).statusCode = 400;
            return next(error);
        }

        const userExist = await userModel.findOne({ address });
        if (userExist) {
            error.message = "User already exist";
            (error as any).statusCode = 400;
            return next(error);
        }

        const registerUser = await userModel.create({ name, username, description, image, address });
        return res.status(201).json({ message: "User created successfully", user: registerUser });
    } catch (error) {
        next(error);
    }
}

export const getUserByAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = req.params.address;
        const userFind = await userModel.findOne({ address })
            .populate('followings', 'username description image address name')
            .populate('followers', 'username description image address');
        if (!userFind) {
            return res.status(200).json({ user: {}, isAuth: false });
        }
        return res.status(200).json({ user: userFind, isAuth: true });
    } catch (error) {
        next(error);
    }
}

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userModel.find()
            .populate({
                path: 'followers',
                select: 'username description image address'
            })
            .populate({
                path: 'followings',
                select: 'username description image address'
            });
        return res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
}