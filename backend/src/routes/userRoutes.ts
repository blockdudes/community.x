import { Router } from "express";
import { userRegister, getUserByAddress, getAllUser } from "../controllers/userController.ts";

const router = Router();

router.post("/user/register", userRegister);
router.get("/user/get/:address", getUserByAddress);
router.get("/user/getAllUsers", getAllUser);

export default router;