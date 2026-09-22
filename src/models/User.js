import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Basic User Information
    // --------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // We store only the hashed password.
    // The user's actual password should never be stored.
    passwordHash: {
      type: String,
      required: true,
    },

    // --------------------------------------------------
    // User Settings / Preferences
    // --------------------------------------------------
    // These values are used as default preferences when
    // the user creates a new automation.
    //
    // Important:
    // These settings do NOT control existing automations.
    // Each automation keeps its own timezone, postingTime,
    // and llmProvider values.
    // --------------------------------------------------

    settings: {
      // Default timezone used when creating a new automation
      timezone: {
        type: String,
        default: "Asia/Dhaka",
        trim: true,
      },

      // Default LLM provider for new automations
      defaultLLMProvider: {
        type: String,
        enum: ["openai", "gemini"],
        default: "gemini",
      },

      // Default posting time for new automations
      // Format: HH:mm
      // Example: "20:00"
      defaultPostingTime: {
        type: String,
        default: "20:00",
        trim: true,
      },
    },
  },
  {
    // Automatically creates:
    // createdAt
    // updatedAt
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;