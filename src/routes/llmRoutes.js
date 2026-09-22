import express from "express";

import {
    testLLM,
} from "../controllers/llmController.js";


const router = express.Router();


router.post(
    "/test",
    testLLM
);


export default router;