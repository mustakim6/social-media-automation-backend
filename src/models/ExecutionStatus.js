import mongoose from "mongoose";

const executionStatusSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        automationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Automation",
            required: true,
        },

        status: {
            type: String,
            enum: ["success", "failed"],
            required: true,
        },

        provider: {
            type: String,
            enum: ["openai", "gemini"],
            required: true,
        },

        executedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically delete documents after 7 days
executionStatusSchema.index(
    { executedAt: 1 },
    { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

const ExecutionStatus = mongoose.model(
    "ExecutionStatus",
    executionStatusSchema
);

export default ExecutionStatus;