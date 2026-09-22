import express from "express";



import {
    getAutomationStatuses,
} from "../controllers/automationStatusController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getAutomationStatuses
);

export default router;