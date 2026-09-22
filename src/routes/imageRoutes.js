import express from "express";

import {
    generateImageController,
} from "../controllers/imageController.js";


const router = express.Router();


router.post(
    "/generate",
    generateImageController
);


export default router;