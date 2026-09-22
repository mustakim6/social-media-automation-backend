import express from "express";

import testContentGeneration
    from "../controllers/contentGenerationTestController.js";

const router = express.Router();

router.post(
    "/",
    testContentGeneration
);

export default router;