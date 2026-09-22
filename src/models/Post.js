import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        facebookPageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FacebookPage",
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "draft",
                "scheduled",
                "publishing",
                "published",
                "failed",
            ],
            default: "draft",
        },

        scheduledAt: {
            type: Date,
            default: null,
        },

        publishedAt: {
            type: Date,
            default: null,
        },

        metaPostId: {
            type: String,
            default: null,
        },

        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;