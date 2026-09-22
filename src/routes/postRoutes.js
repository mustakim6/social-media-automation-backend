import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
    createPost,
} from "../controllers/postController.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createPost
);

export default router;