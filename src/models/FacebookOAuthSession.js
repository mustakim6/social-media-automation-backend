import mongoose from "mongoose";

const facebookOAuthSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        pages: [
            {
                pageId: {
                    type: String,
                    required: true,
                },

                pageName: {
                    type: String,
                    required: true,
                    trim: true,
                },

                pageAccessToken: {
                    type: String,
                    required: true,
                },
            },
        ],

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically delete expired OAuth sessions
facebookOAuthSessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const FacebookOAuthSession = mongoose.model(
    "FacebookOAuthSession",
    facebookOAuthSessionSchema
);

export default FacebookOAuthSession;