import User from "../models/User.js";

// --------------------------------------------------
// Get Current User Settings
// --------------------------------------------------
// GET /api/settings
//
// Returns the settings of the currently authenticated user.
// The user ID comes from authMiddleware through req.userId.
// --------------------------------------------------

const getSettings = async (req, res) => {
    try {
        const user = await User.findById(
            req.userId
        ).select("name email settings");

        if (!user) {
            return res.status(404).json({
                status: "ERR",
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: "OK",

            settings: {
                name: user.name,
                email: user.email,

                // Fallback values are useful for users
                // created before the settings fields existed.
                timezone:
                    user.settings?.timezone ||
                    "Asia/Dhaka",

                defaultLLMProvider:
                    user.settings
                        ?.defaultLLMProvider ||
                    "gemini",

                defaultPostingTime:
                    user.settings
                        ?.defaultPostingTime ||
                    "20:00",
            },
        });
    } catch (error) {
        console.error(
            "Get settings error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message: "Failed to load settings",
        });
    }
};

// --------------------------------------------------
// Update Current User Settings
// --------------------------------------------------
// PATCH /api/settings
//
// Only the authenticated user's settings can be updated.
// Supports partial updates.
// --------------------------------------------------

const updateSettings = async (req, res) => {
    try {
        const {
            timezone,
            defaultLLMProvider,
            defaultPostingTime,
        } = req.body;

        // --------------------------------------------------
        // Validate LLM Provider
        // --------------------------------------------------

        if (
            defaultLLMProvider !== undefined &&
            !["openai", "gemini"].includes(
                defaultLLMProvider
            )
        ) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Invalid LLM provider",
            });
        }

        // --------------------------------------------------
        // Validate Posting Time
        // --------------------------------------------------
        // Expected format: HH:mm
        // Example: 20:00
        // --------------------------------------------------

        if (
            defaultPostingTime !== undefined &&
            !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(
                defaultPostingTime
            )
        ) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Invalid posting time. Use HH:mm format.",
            });
        }

        // --------------------------------------------------
        // Find Current User
        // --------------------------------------------------

        const user = await User.findById(
            req.userId
        );

        if (!user) {
            return res.status(404).json({
                status: "ERR",
                message: "User not found",
            });
        }

        // --------------------------------------------------
        // Make Sure Settings Object Exists
        // --------------------------------------------------
        // Important for users created before we added
        // the settings object to the User schema.
        // --------------------------------------------------

        if (!user.settings) {
            user.settings = {};
        }

        // --------------------------------------------------
        // Update Only Provided Values
        // --------------------------------------------------

        if (timezone !== undefined) {
            user.settings.timezone = timezone;
        }

        if (
            defaultLLMProvider !== undefined
        ) {
            user.settings.defaultLLMProvider =
                defaultLLMProvider;
        }

        if (
            defaultPostingTime !== undefined
        ) {
            user.settings.defaultPostingTime =
                defaultPostingTime;
        }

        // Save changes
        await user.save();

        return res.status(200).json({
            status: "OK",

            message:
                "Settings updated successfully",

            settings: {
                name: user.name,
                email: user.email,

                timezone:
                    user.settings.timezone,

                defaultLLMProvider:
                    user.settings
                        .defaultLLMProvider,

                defaultPostingTime:
                    user.settings
                        .defaultPostingTime,
            },
        });
    } catch (error) {
        console.error(
            "Update settings error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to update settings",
        });
    }
};

export {
    getSettings,
    updateSettings,
};