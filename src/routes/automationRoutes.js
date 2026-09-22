import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import {
    createAutomation,
    getAutomations,
    getAutomation,
    updateAutomation,
    deleteAutomation,
    runAutomation,
} from "../controllers/automationController.js";

const router = express.Router();


// ================================================
// CREATE
// ================================================

router.post(
    "/",
    authMiddleware,
    createAutomation
);


// ================================================
// GET ALL
// ================================================

router.get(
    "/",
    authMiddleware,
    getAutomations
);


// ================================================
// MANUAL RUN
// ================================================

router.post(
    "/:automationId/run",
    authMiddleware,
    runAutomation
);


// ================================================
// GET SINGLE
// ================================================

router.get(
    "/:automationId",
    authMiddleware,
    getAutomation
);


// ================================================
// UPDATE
// ================================================

router.patch(
    "/:automationId",
    authMiddleware,
    updateAutomation
);


// ================================================
// DELETE
// ================================================

router.delete(
    "/:automationId",
    authMiddleware,
    deleteAutomation
);


export default router;