import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import {
    getSettings,
    updateSettings,
} from "../controllers/settingsController.js";

const router = express.Router();

// --------------------------------------------------
// GET /api/settings
// --------------------------------------------------
// Returns settings of the currently authenticated user.
// --------------------------------------------------

router.get(
    "/",
    authMiddleware,
    getSettings
);

// --------------------------------------------------
// PATCH /api/settings
// --------------------------------------------------
// Updates settings of the currently authenticated user.
// --------------------------------------------------

router.patch(
    "/",
    authMiddleware,
    updateSettings
);

export default router;