





import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
});

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");
const { default: startAutomationScheduler } =
    await import("./scheduler/automationScheduler.js");

const PORT = process.env.PORT || 5000;




const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        startAutomationScheduler();
    } catch (error) {
        console.error("Error starting server:", error.message);
        process.exit(1);
    }
};

startServer();