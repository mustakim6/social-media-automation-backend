import mongoose from "mongoose";
import { DateTime } from "luxon";


// --------------------------------
// Constants
// --------------------------------

const CONTENT_TYPES = [
    "text_only",
    "card",
    "text_and_image",
];

const LLM_PROVIDERS = [
    "openai",
    "gemini",
];

const CARD_COLOR_MODES = [
    "fixed",
    "random",
];

const CARD_THEMES = [
    "midnight",
    "ocean",
    "forest",
    "berry",
    "sunset",
    "royal",
    "teal",
];

const CARD_TEMPLATES = [
    "quote",
];


// ================================================
// CREATE AUTOMATION VALIDATION
// ================================================

const validateCreateAutomation = ({
    facebookPageId,
    prompt,
    contentType = "text_only",
    imagePrompt,
    cardColorMode = "fixed",
    cardTheme = "midnight",
    cardTemplate = "quote",
    llmProvider,
    postingTime,
    timezone,
}) => {

    // --------------------------------
    // Facebook Page
    // --------------------------------

    if (!facebookPageId) {
        return "facebookPageId is required";
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            facebookPageId
        )
    ) {
        return "Invalid facebookPageId";
    }


    // --------------------------------
    // Prompt
    // --------------------------------

    if (
        !prompt ||
        typeof prompt !== "string" ||
        !prompt.trim()
    ) {
        return "Prompt is required";
    }


    // --------------------------------
    // LLM Provider
    // --------------------------------

    if (
        !LLM_PROVIDERS.includes(
            llmProvider
        )
    ) {
        return (
            "llmProvider must be either openai or gemini"
        );
    }


    // --------------------------------
    // Content Type
    // --------------------------------

    if (
        !CONTENT_TYPES.includes(
            contentType
        )
    ) {
        return (
            "contentType must be text_only, card, or text_and_image"
        );
    }


    // ========================================
    // CARD VALIDATION
    // ========================================

    if (
        contentType === "card"
    ) {

        // --------------------------------
        // Card Color Mode
        // --------------------------------

        if (
            !CARD_COLOR_MODES.includes(
                cardColorMode
            )
        ) {
            return (
                "cardColorMode must be either fixed or random"
            );
        }


        // --------------------------------
        // Card Theme
        // --------------------------------
        //
        // Required only for fixed mode.
        //
        // Example:
        // midnight
        // ocean
        // forest
        //
        // --------------------------------

        if (
            cardColorMode === "fixed"
        ) {

            if (
                !CARD_THEMES.includes(
                    cardTheme
                )
            ) {
                return (
                    "cardTheme must be a valid card theme"
                );
            }
        }


        // --------------------------------
        // Card Template
        // --------------------------------

        if (
            !CARD_TEMPLATES.includes(
                cardTemplate
            )
        ) {
            return (
                "Invalid cardTemplate"
            );
        }
    }


    // ========================================
    // AI IMAGE VALIDATION
    // ========================================

    if (
        contentType === "text_and_image"
    ) {

        if (
            !imagePrompt ||
            typeof imagePrompt !== "string" ||
            !imagePrompt.trim()
        ) {
            return (
                "imagePrompt is required when contentType is text_and_image"
            );
        }
    }


    // --------------------------------
    // Posting Time
    // --------------------------------

    if (
        !postingTime ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(
            postingTime
        )
    ) {
        return (
            "postingTime must be in HH:mm format"
        );
    }


    // --------------------------------
    // Timezone
    // --------------------------------

    if (
        !timezone ||
        !DateTime.now()
            .setZone(timezone)
            .isValid
    ) {
        return "Invalid timezone";
    }


    return null;
};


// ================================================
// UPDATE AUTOMATION VALIDATION
// ================================================

const validateUpdateAutomation = ({
    facebookPageId,
    prompt,
    contentType,
    imagePrompt,
    cardColorMode,
    cardTheme,
    cardTemplate,
    llmProvider,
    postingTime,
    timezone,
    isActive,
}) => {

    // --------------------------------
    // Facebook Page
    // --------------------------------

    if (
        facebookPageId !== undefined &&
        !mongoose.Types.ObjectId.isValid(
            facebookPageId
        )
    ) {
        return "Invalid facebookPageId";
    }


    // --------------------------------
    // Prompt
    // --------------------------------

    if (
        prompt !== undefined &&
        (
            typeof prompt !== "string" ||
            !prompt.trim()
        )
    ) {
        return "Prompt cannot be empty";
    }


    // --------------------------------
    // LLM Provider
    // --------------------------------

    if (
        llmProvider !== undefined &&
        !LLM_PROVIDERS.includes(
            llmProvider
        )
    ) {
        return (
            "llmProvider must be either openai or gemini"
        );
    }


    // --------------------------------
    // Content Type
    // --------------------------------

    if (
        contentType !== undefined &&
        !CONTENT_TYPES.includes(
            contentType
        )
    ) {
        return (
            "contentType must be text_only, card, or text_and_image"
        );
    }


    // --------------------------------
    // Card Color Mode
    // --------------------------------

    if (
        cardColorMode !== undefined &&
        !CARD_COLOR_MODES.includes(
            cardColorMode
        )
    ) {
        return (
            "cardColorMode must be either fixed or random"
        );
    }


    // --------------------------------
    // Card Theme
    // --------------------------------

    if (
        cardTheme !== undefined &&
        !CARD_THEMES.includes(
            cardTheme
        )
    ) {
        return (
            "cardTheme must be a valid card theme"
        );
    }


    // --------------------------------
    // Card Template
    // --------------------------------

    if (
        cardTemplate !== undefined &&
        !CARD_TEMPLATES.includes(
            cardTemplate
        )
    ) {
        return "Invalid cardTemplate";
    }


    // --------------------------------
    // AI Image Prompt
    // --------------------------------

    if (
        contentType ===
        "text_and_image"
    ) {

        if (
            !imagePrompt ||
            typeof imagePrompt !== "string" ||
            !imagePrompt.trim()
        ) {
            return (
                "imagePrompt is required when contentType is text_and_image"
            );
        }
    }


    // --------------------------------
    // Image Prompt Type
    // --------------------------------

    if (
        imagePrompt !== undefined &&
        typeof imagePrompt !== "string"
    ) {
        return (
            "imagePrompt must be a string"
        );
    }


    // --------------------------------
    // Posting Time
    // --------------------------------

    if (
        postingTime !== undefined &&
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(
            postingTime
        )
    ) {
        return (
            "postingTime must be in HH:mm format"
        );
    }


    // --------------------------------
    // Timezone
    // --------------------------------

    if (
        timezone !== undefined &&
        !DateTime.now()
            .setZone(timezone)
            .isValid
    ) {
        return "Invalid timezone";
    }


    // --------------------------------
    // Active State
    // --------------------------------

    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
        return (
            "isActive must be a boolean"
        );
    }


    return null;
};


// ================================================
// AUTOMATION ID VALIDATION
// ================================================

const validateAutomationId = (
    automationId
) => {

    if (
        !automationId ||
        !mongoose.Types.ObjectId.isValid(
            automationId
        )
    ) {
        return "Invalid automation ID";
    }

    return null;
};


export {
    validateCreateAutomation,
    validateUpdateAutomation,
    validateAutomationId,
};