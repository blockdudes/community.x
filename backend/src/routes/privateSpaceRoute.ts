import { Router } from "express";
import { createPrivateSpace, joinPrivateSpace, getPrivateSpace } from "../controllers/privateSpaceController.ts";

const router = Router();

router.post("/create/private/space", createPrivateSpace);
router.post("/private/space/join/member", joinPrivateSpace);

router.get('/get/private/space/:privateSpaceId', getPrivateSpace);

export default router; 