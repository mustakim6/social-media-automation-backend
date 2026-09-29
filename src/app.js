import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import facebookRoutes from "./routes/facebookRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import automationStatusRoutes from "./routes/automationStatusRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import cardTestRoutes from "./routes/cardTestRoutes.js";
import contentGenerationTestRoutes from "./routes/contentGenerationTestRoutes.js";
import facebookWebhookRoutes from "./routes/facebookWebhookRoutes.js";


// ==================================================
// Create Express Application
// ==================================================

const app = express();


// ==================================================
// Global Middlewares
// ==================================================

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);


// --------------------------------------------------
// JSON body parser
// --------------------------------------------------

app.use(express.json());


// --------------------------------------------------
// URL-encoded body parser
// Required for Meta signed_request
// --------------------------------------------------

app.use(
    express.urlencoded({
        extended: true,
    })
);


// --------------------------------------------------
// Cookie parser
// --------------------------------------------------

app.use(cookieParser());


// ==================================================
// Public Health Check
// ==================================================

app.get(
    "/api/health",
    (req, res) => {
        return res.status(200).json({
            status: "OK",
            message: "Server is running!",
        });
    }
);


// ==================================================
// API Routes
// ==================================================


// --------------------------------------------------
// Authentication
// --------------------------------------------------

app.use(
    "/api/auth",
    authRoutes
);


// --------------------------------------------------
// Facebook
// --------------------------------------------------

app.use(
    "/api/facebook",
    facebookRoutes
);


// --------------------------------------------------
// LLM
// --------------------------------------------------

app.use(
    "/api/llm",
    llmRoutes
);


// --------------------------------------------------
// Automation Status
// --------------------------------------------------

app.use(
    "/api/automations/status",
    automationStatusRoutes
);


// --------------------------------------------------
// Automation
// --------------------------------------------------

app.use(
    "/api/automations",
    automationRoutes
);


// --------------------------------------------------
// Dashboard
// --------------------------------------------------

app.use(
    "/api/dashboard",
    dashboardRoutes
);


// --------------------------------------------------
// Settings
// --------------------------------------------------

app.use(
    "/api/settings",
    settingsRoutes
);


// --------------------------------------------------
// LLM Image
// --------------------------------------------------

app.use(
    "/api/llm/image",
    imageRoutes
);


// --------------------------------------------------
// Card Test
// --------------------------------------------------

app.use(
    "/api/llm/test-card",
    cardTestRoutes
);


// --------------------------------------------------
// Content Generation Test
// --------------------------------------------------

app.use(
    "/api/llm/test-content",
    contentGenerationTestRoutes
);


// ==================================================
// Meta / Facebook Webhook Routes


app.use(
    "/api/facebook/webhook",
    facebookWebhookRoutes
);


// ==================================================
// Export App
// ==================================================

export default app;