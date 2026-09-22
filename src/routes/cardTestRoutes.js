import express from "express";
import testCardGeneration
    from "../controllers/cardTestController.js";

const router = express.Router();

router.post(
    "/",
    testCardGeneration
);

export default router;