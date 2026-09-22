import mongoose from "mongoose";


const automationSchema = new mongoose.Schema(
    {
        // --------------------------------
        // User
        // --------------------------------

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },


        // --------------------------------
        // Facebook Page
        // --------------------------------

        facebookPageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FacebookPage",
            required: true,
        },


        // --------------------------------
        // User Prompt
        // --------------------------------

        prompt: {
            type: String,
            required: true,
            trim: true,
        },


        // --------------------------------
        // Content Type
        // --------------------------------

        contentType: {
            type: String,

            enum: [
                "text_only",
                "card",
                "text_and_image",
            ],

            default: "text_only",
        },


        // --------------------------------
        // AI Image Prompt
        // --------------------------------
        //
        // Used only when contentType is
        // "text_and_image".
        //
        // --------------------------------

        imagePrompt: {
            type: String,

            default: "",

            trim: true,
        },


        // --------------------------------
        // Card Theme Mode
        // --------------------------------
        //
        // fixed:
        //     User selects one predefined
        //     visual theme.
        //
        // random:
        //     Platform selects a theme from
        //     the predefined theme collection.
        //
        // --------------------------------

        cardColorMode: {
            type: String,

            enum: [
                "fixed",
                "random",
            ],

            default: "fixed",
        },


        // --------------------------------
        // Card Theme
        // --------------------------------
        //
        // Used when cardColorMode = "fixed".
        //
        // This stores a predefined theme key,
        // NOT a raw color value.
        //
        // Example:
        // "midnight"
        // "ocean"
        // "forest"
        // "berry"
        //
        // --------------------------------

        cardTheme: {
            type: String,

            enum: [
                "midnight",
                "ocean",
                "forest",
                "berry",
                "sunset",
                "royal",
                "teal",
            ],

            default: "midnight",

            trim: true,
        },


        // --------------------------------
        // Last Card Theme
        // --------------------------------
        //
        // Used for random theme mode.
        //
        // We can use this value to prevent
        // the same theme from being selected
        // repeatedly.
        //
        // --------------------------------

        lastCardTheme: {
            type: String,

            enum: [
                "midnight",
                "ocean",
                "forest",
                "berry",
                "sunset",
                "royal",
                "teal",
            ],

            default: null,

            trim: true,
        },


        // --------------------------------
        // Card Template
        // --------------------------------
        //
        // Currently we start with one
        // template.
        //
        // More templates can be added later.
        //
        // --------------------------------

        cardTemplate: {
            type: String,

            enum: [
                "quote",
            ],

            default: "quote",
        },


        // --------------------------------
        // LLM Provider
        // --------------------------------

        llmProvider: {
            type: String,

            enum: [
                "openai",
                "gemini",
            ],

            required: true,
        },


        // --------------------------------
        // Frequency
        // --------------------------------

        frequency: {
            type: String,

            enum: [
                "daily",
            ],

            default: "daily",
        },


        // --------------------------------
        // Posting Time
        // --------------------------------

        postingTime: {
            type: String,

            required: true,
        },


        // --------------------------------
        // Timezone
        // --------------------------------

        timezone: {
            type: String,

            required: true,

            default: "Asia/Dhaka",
        },


        // --------------------------------
        // Automation Status
        // --------------------------------

        isActive: {
            type: Boolean,

            default: true,
        },


        // --------------------------------
        // Last Successful Execution
        // --------------------------------

        lastRunAt: {
            type: Date,

            default: null,
        },


        // --------------------------------
        // Next Scheduled Execution
        // --------------------------------

        nextRunAt: {
            type: Date,

            default: null,
        },


        // --------------------------------
        // Retry Information
        // --------------------------------

        retryCount: {
            type: Number,

            default: 0,
        },


        retryAt: {
            type: Date,

            default: null,
        },


        // --------------------------------
        // Last Error
        // --------------------------------

        lastError: {
            type: String,

            default: null,
        },


        // --------------------------------
        // Last Failed Execution
        // --------------------------------

        lastFailedAt: {
            type: Date,

            default: null,
        },


        // --------------------------------
        // Execution Lock
        // --------------------------------
        //
        // Prevents the same automation from
        // being executed multiple times
        // simultaneously.
        //
        // --------------------------------

        isRunning: {
            type: Boolean,

            default: false,
        },
    },


    // --------------------------------
    // Timestamps
    // --------------------------------

    {
        timestamps: true,
    }
);


const Automation = mongoose.model(
    "Automation",
    automationSchema
);


export default Automation;