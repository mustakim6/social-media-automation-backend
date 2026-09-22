import mongoose from "mongoose";

const facebookPageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    tokenExpiresAt: {
      type: Date,
      default: null,
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

facebookPageSchema.index(
  { userId: 1, pageId: 1 },
  { unique: true }
);

const FacebookPage = mongoose.model(
  "FacebookPage",
  facebookPageSchema
);

export default FacebookPage;