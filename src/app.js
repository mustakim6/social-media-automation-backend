
import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js"
import facebookRoutes from "./routes/facebookRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import automationStatusRoutes
    from "./routes/automationStatusRoutes.js";
    import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import cardTestRoutes
    from "./routes/cardTestRoutes.js";
import contentGenerationTestRoutes
    from "./routes/contentGenerationTestRoutes.js";

// Create an instance of the Express application
const app = express();

// Middlewares
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

//mount routes

app.use("/api/auth", authRoutes)
app.use("/api/facebook", facebookRoutes)
// app.use("/api/posts", postRoutes);


app.use("/api/llm", llmRoutes);

app.use(
    "/api/automations/status",
    automationStatusRoutes
);

app.use(
    "/api/automations",
    automationRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/settings",
    settingsRoutes
);

app.use(
    "/api/llm/image",
    imageRoutes
);

app.use(
    "/api/llm/test-card",
    cardTestRoutes
);

app.use(
    "/api/llm/test-content",
    contentGenerationTestRoutes
);

export default app;


