import mongoose from "mongoose";

const facebookDataDeletionRequestSchema =
    new mongoose.Schema(
        {
            confirmationCode: {
                type: String,
                required: true,
                unique: true,
                index: true,
            },

            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            metaUserId: {
                type: String,
                required: true,
                index: true,
            },

            status: {
                type: String,
                enum: [
                    "completed",
                    "failed",
                ],
                default: "completed",
            },

            requestedAt: {
                type: Date,
                default: Date.now,
            },

            completedAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            timestamps: true,
        }
    );

const FacebookDataDeletionRequest =
    mongoose.model(
        "FacebookDataDeletionRequest",
        facebookDataDeletionRequestSchema
    );

export default FacebookDataDeletionRequest;