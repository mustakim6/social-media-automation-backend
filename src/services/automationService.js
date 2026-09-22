import Automation from "../models/Automation.js";
import FacebookPage from "../models/FacebookPage.js";
import calculateNextRunAt from "../utils/scheduleUtils.js";


// ================================================
// CREATE AUTOMATION
// ================================================

const createAutomation = async ({
    userId,
    facebookPageId,
    prompt,

    contentType = "text_only",

    imagePrompt = "",

    // Card fields
    cardColorMode = "fixed",
    cardTheme = "midnight",
    cardTemplate = "quote",

    llmProvider,

    postingTime,
    timezone,
}) => {

    // --------------------------------
    // Validate Facebook Page ownership
    // --------------------------------

    const page = await FacebookPage.findOne({
        _id: facebookPageId,
        userId,
        isActive: true,
    });


    if (!page) {
        throw new Error(
            "Facebook Page not found"
        );
    }


    // --------------------------------
    // Calculate first execution time
    // --------------------------------

    const nextRunAt =
        calculateNextRunAt({
            postingTime,
            timezone,
        });


    // --------------------------------
    // Create automation
    // --------------------------------

    const automation =
        await Automation.create({

            userId,

            facebookPageId,

            prompt,


            // --------------------------------
            // Content
            // --------------------------------

            contentType,


            // --------------------------------
            // AI Image
            // --------------------------------
            //
            // Used only when
            // contentType = text_and_image
            //
            // --------------------------------

            imagePrompt,


            // --------------------------------
            // Card
            // --------------------------------

            cardColorMode,

            cardTheme,

            cardTemplate,


            // --------------------------------
            // LLM
            // --------------------------------

            llmProvider,


            // --------------------------------
            // Schedule
            // --------------------------------

            frequency: "daily",

            postingTime,

            timezone,

            nextRunAt,
        });


    return automation;
};


// ================================================
// GET USER AUTOMATIONS
// ================================================

const getUserAutomations = async (
    userId
) => {

    const automations =
        await Automation.find({
            userId,
        })
            .populate(
                "facebookPageId",
                "pageName pageId"
            )
            .sort({
                createdAt: -1,
            });


    return automations;
};


// ================================================
// GET SINGLE AUTOMATION
// ================================================

const getAutomationById = async ({
    automationId,
    userId,
}) => {

    const automation =
        await Automation.findOne({
            _id: automationId,
            userId,
        })
            .populate(
                "facebookPageId",
                "pageName pageId"
            );


    if (!automation) {
        throw new Error(
            "Automation not found"
        );
    }


    return automation;
};


// ================================================
// UPDATE AUTOMATION
// ================================================

const updateAutomation = async ({
    automationId,

    userId,

    facebookPageId,

    prompt,

    contentType,

    imagePrompt,

    // Card fields
    cardColorMode,
    cardTheme,
    cardTemplate,

    llmProvider,

    postingTime,

    timezone,

    isActive,
}) => {

    // --------------------------------
    // Find automation
    // --------------------------------

    const automation =
        await Automation.findOne({
            _id: automationId,
            userId,
        });


    if (!automation) {
        throw new Error(
            "Automation not found"
        );
    }


    // --------------------------------
    // Keep previous active state
    // --------------------------------

    const wasActive =
        automation.isActive;


    // ========================================
    // FACEBOOK PAGE
    // ========================================

    if (
        facebookPageId !== undefined
    ) {

        const page =
            await FacebookPage.findOne({
                _id: facebookPageId,

                userId,

                isActive: true,
            });


        if (!page) {
            throw new Error(
                "Facebook Page not found"
            );
        }


        automation.facebookPageId =
            facebookPageId;
    }


    // ========================================
    // PROMPT
    // ========================================

    if (
        prompt !== undefined
    ) {

        automation.prompt =
            prompt;
    }


    // ========================================
    // CONTENT TYPE
    // ========================================

    if (
        contentType !== undefined
    ) {

        automation.contentType =
            contentType;
    }


    // ========================================
    // IMAGE PROMPT
    // ========================================

    if (
        imagePrompt !== undefined
    ) {

        automation.imagePrompt =
            imagePrompt;
    }


    // ========================================
    // CARD COLOR MODE
    // ========================================

    if (
        cardColorMode !== undefined
    ) {

        automation.cardColorMode =
            cardColorMode;
    }


    // ========================================
    // CARD THEME
    // ========================================

    if (
        cardTheme !== undefined
    ) {

        automation.cardTheme =
            cardTheme;
    }


    // ========================================
    // CARD TEMPLATE
    // ========================================

    if (
        cardTemplate !== undefined
    ) {

        automation.cardTemplate =
            cardTemplate;
    }


    // ========================================
    // LLM PROVIDER
    // ========================================

    if (
        llmProvider !== undefined
    ) {

        automation.llmProvider =
            llmProvider;
    }


    // ========================================
    // POSTING TIME
    // ========================================

    if (
        postingTime !== undefined
    ) {

        automation.postingTime =
            postingTime;
    }


    // ========================================
    // TIMEZONE
    // ========================================

    if (
        timezone !== undefined
    ) {

        automation.timezone =
            timezone;
    }


    // ========================================
    // LIFECYCLE TRANSITIONS
    // ========================================

    const isPausing =
        isActive === false &&
        wasActive === true;


    const isResuming =
        isActive === true &&
        wasActive === false;


    // --------------------------------
    // Active state
    // --------------------------------

    if (
        isActive !== undefined
    ) {

        automation.isActive =
            isActive;
    }


    // ========================================
    // SCHEDULE
    // ========================================

    const scheduleChanged =
        postingTime !== undefined ||
        timezone !== undefined;


    if (
        scheduleChanged ||
        isResuming
    ) {

        automation.nextRunAt =
            calculateNextRunAt({
                postingTime:
                    automation.postingTime,

                timezone:
                    automation.timezone,
            });
    }


    // ========================================
    // PAUSE
    // ========================================

    if (isPausing) {

        automation.retryCount =
            0;

        automation.retryAt =
            null;
    }


    // ========================================
    // RESUME
    // ========================================

    if (isResuming) {

        automation.retryCount =
            0;

        automation.retryAt =
            null;

        automation.lastError =
            null;

        automation.lastFailedAt =
            null;
    }


    // ========================================
    // SAVE
    // ========================================

    await automation.save();


    // ========================================
    // RETURN UPDATED AUTOMATION
    // ========================================

    return await Automation.findById(
        automation._id
    )
        .populate(
            "facebookPageId",
            "pageName pageId"
        );
};


// ================================================
// DELETE AUTOMATION
// ================================================

const deleteAutomation = async ({
    automationId,
    userId,
}) => {

    const automation =
        await Automation.findOne({
            _id: automationId,
            userId,
        });


    if (!automation) {
        throw new Error(
            "Automation not found"
        );
    }


    // --------------------------------
    // Prevent deleting running job
    // --------------------------------

    if (
        automation.isRunning
    ) {

        throw new Error(
            "Cannot delete automation while it is running"
        );
    }


    // --------------------------------
    // Delete
    // --------------------------------

    await Automation.deleteOne({
        _id: automationId,
        userId,
    });


    return automation;
};


// ================================================
// EXPORT
// ================================================

export {
    createAutomation,
    getUserAutomations,
    getAutomationById,
    updateAutomation,
    deleteAutomation,
};