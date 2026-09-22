import Automation from "../models/Automation.js";
import FacebookPage from "../models/FacebookPage.js";
import calculateNextRunAt from "../utils/scheduleUtils.js";

import generateContent
    from "./llm/contentGenerationService.js";

import generateImage
    from "./image/imageGenerationService.js";

import renderCard
    from "./card/cardRenderer.js";

import {
    publishToFacebookPage,
    publishPhotoToFacebookPage,
} from "./facebookService.js";

import {
    recordExecutionStatus,
} from "./executionStatusService.js";


// ----------------------------------------
// Card Themes
// ----------------------------------------

const CARD_THEMES = [
    "midnight",
    "ocean",
    "forest",
    "berry",
    "sunset",
    "royal",
    "teal",
];


// ----------------------------------------
// Get Random Card Theme
// ----------------------------------------

const getRandomCardTheme = (
    lastCardTheme = null
) => {

    let availableThemes =
        CARD_THEMES;

    // Avoid immediate repeat
    if (
        lastCardTheme &&
        CARD_THEMES.length > 1
    ) {
        availableThemes =
            CARD_THEMES.filter(
                (theme) =>
                    theme !== lastCardTheme
            );
    }

    const randomIndex =
        Math.floor(
            Math.random() *
                availableThemes.length
        );

    return availableThemes[
        randomIndex
    ];
};


// ----------------------------------------
// Get Card Theme
// ----------------------------------------

const getCardTheme = (
    automation
) => {

    // Random mode
    if (
        automation.cardColorMode ===
        "random"
    ) {
        return getRandomCardTheme(
            automation.lastCardTheme
        );
    }

    // Fixed mode
    return (
        automation.cardTheme ||
        "midnight"
    );
};


// ----------------------------------------
// Execute Automation
// ----------------------------------------

const executeAutomation = async (
    automation
) => {

    console.log(
        "Executing automation:",
        {
            automationId:
                automation._id,

            facebookPageId:
                automation.facebookPageId,

            llmProvider:
                automation.llmProvider,

            contentType:
                automation.contentType,
        }
    );


    try {

        // ========================================
        // 1. Get Facebook Page
        // ========================================

        const page =
            await FacebookPage.findOne({
                _id:
                    automation.facebookPageId,

                userId:
                    automation.userId,

                isActive:
                    true,
            });


        if (!page) {
            throw new Error(
                "Facebook Page not found or inactive"
            );
        }


        // ========================================
        // 2. Generate Content + Caption
        // ========================================

        console.log(
            `Generating content and caption using ${automation.llmProvider}...`
        );


        const {
            content,
            caption,
        } = await generateContent({
            provider:
                automation.llmProvider,

            prompt:
                automation.prompt,

            contentType:
                automation.contentType,
        });


        // ----------------------------------------
        // Validate Content
        // ----------------------------------------

        if (
            !content ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            throw new Error(
                "LLM returned empty content"
            );
        }


        // ----------------------------------------
        // Validate Caption
        // ----------------------------------------

        if (
            !caption ||
            typeof caption !== "string" ||
            !caption.trim()
        ) {
            throw new Error(
                "LLM returned empty caption"
            );
        }


        const generatedContent =
            content.trim();

        const generatedCaption =
            caption.trim();


        console.log(
            "Content generated successfully:",
            generatedContent
        );


        console.log(
            "Caption generated successfully:",
            generatedCaption
        );


        // ========================================
        // 3. Publish Content
        // ========================================


        // ========================================
        // 3A. CARD
        // ========================================

        if (
            automation.contentType ===
            "card"
        ) {

            console.log(
                "Generating Facebook card..."
            );


            // ------------------------------------
            // Select Card Theme
            // ------------------------------------

            const cardTheme =
                getCardTheme(
                    automation
                );


            console.log(
                "Selected card theme:",
                cardTheme
            );


            // ------------------------------------
            // Render Card in Memory
            // ------------------------------------

            const cardBuffer =
                await renderCard({
                    text:
                        generatedContent,

                    pageName:
                        page.pageName,

                    theme:
                        cardTheme,
                });


            if (
                !cardBuffer ||
                !Buffer.isBuffer(
                    cardBuffer
                )
            ) {
                throw new Error(
                    "Card renderer did not return a valid image buffer"
                );
            }


            console.log(
                "Card generated successfully"
            );


            // ------------------------------------
            // Publish Card to Facebook
            // ------------------------------------

            console.log(
                `Publishing card to Facebook Page: ${page.pageName}`
            );


            const publishResult =
                await publishPhotoToFacebookPage({
                    pageId:
                        page.pageId,

                    pageAccessToken:
                        page.pageAccessToken,

                    imageBuffer:
                        cardBuffer,

                    // Separate Facebook caption
                    caption:
                        generatedCaption,
                });


            console.log(
                "Facebook card published successfully:",
                publishResult
            );


            // ------------------------------------
            // Save Last Random Theme
            // ------------------------------------

            if (
                automation.cardColorMode ===
                "random"
            ) {

                await Automation.findByIdAndUpdate(
                    automation._id,
                    {
                        $set: {
                            lastCardTheme:
                                cardTheme,
                        },
                    }
                );
            }
        }


        // ========================================
        // 3B. TEXT + AI IMAGE
        // ========================================

        else if (
            automation.contentType ===
            "text_and_image"
        ) {

            console.log(
                "Generating AI image..."
            );


            const generatedImage =
                await generateImage({
                    provider:
                        "gemini",

                    prompt:
                        automation.imagePrompt,
                });


            console.log(
                "AI image generated successfully"
            );


            console.log(
                "Generated image MIME type:",
                generatedImage.mimeType
            );


            // ------------------------------------
            // Temporary Stage
            // ------------------------------------
            //
            // Image publishing/storage flow
            // is not implemented yet.
            // ------------------------------------

            throw new Error(
                "AI image storage and Facebook photo publishing are not implemented yet"
            );
        }


        // ========================================
        // 3C. TEXT ONLY
        // ========================================

        else {

            console.log(
                `Publishing text post to Facebook Page: ${page.pageName}`
            );


            const publishResult =
                await publishToFacebookPage({
                    pageId:
                        page.pageId,

                    pageAccessToken:
                        page.pageAccessToken,

                    // Content becomes
                    // Facebook text post
                    message:
                        generatedContent,
                });


            console.log(
                "Facebook text post published successfully:",
                publishResult
            );
        }


        // ========================================
        // 4. Calculate Next Execution Time
        // ========================================

        const now =
            new Date();


        const nextRunAt =
            calculateNextRunAt({
                postingTime:
                    automation.postingTime,

                timezone:
                    automation.timezone,
            });


        // ========================================
        // 5. Update Automation After Success
        // ========================================

        await Automation.findByIdAndUpdate(
            automation._id,
            {
                lastRunAt:
                    now,

                nextRunAt,

                // Reset retry state
                retryCount:
                    0,

                retryAt:
                    null,

                lastError:
                    null,

                lastFailedAt:
                    null,
            }
        );


        // ========================================
        // 6. Record Successful Execution
        // ========================================

        try {

            await recordExecutionStatus({
                userId:
                    automation.userId,

                automationId:
                    automation._id,

                status:
                    "success",

                provider:
                    automation.llmProvider,
            });


            console.log(
                "Execution status recorded:",
                {
                    automationId:
                        automation._id,

                    status:
                        "success",

                    provider:
                        automation.llmProvider,
                }
            );

        } catch (
            statusError
        ) {

            console.error(
                "Failed to record execution success status:",
                statusError
            );
        }


        // ========================================
        // 7. Final Success Log
        // ========================================

        console.log(
            "Automation completed successfully:",
            {
                automationId:
                    automation._id,

                facebookPage:
                    page.pageName,

                llmProvider:
                    automation.llmProvider,

                contentType:
                    automation.contentType,

                nextRunAt,
            }
        );

    } catch (error) {

        // ========================================
        // Execution Error
        // ========================================

        console.error(
            `Automation execution failed (${automation._id}):`,
            error
        );


        // ========================================
        // Retry Configuration
        // ========================================

        const retryCount =
            automation.retryCount || 0;


        const MAX_RETRIES = 3;


        // ========================================
        // Schedule Retry
        // ========================================

        if (
            retryCount <
            MAX_RETRIES
        ) {

            const nextRetryCount =
                retryCount + 1;


            const retryDelayMinutes =
                nextRetryCount === 1
                    ? 5
                    : 10;


            const retryAt =
                new Date(
                    Date.now() +
                    retryDelayMinutes *
                    60 *
                    1000
                );


            // ------------------------------------
            // Calculate next normal schedule
            // ------------------------------------

            const nextRunAt =
                calculateNextRunAt({
                    postingTime:
                        automation.postingTime,

                    timezone:
                        automation.timezone,
                });


            await Automation.findByIdAndUpdate(
                automation._id,
                {
                    retryCount:
                        nextRetryCount,

                    retryAt,

                    nextRunAt,

                    lastError:
                        error.message,

                    lastFailedAt:
                        new Date(),
                }
            );


            console.log(
                "Automation retry scheduled:",
                {
                    automationId:
                        automation._id,

                    retryCount:
                        nextRetryCount,

                    retryAt,

                    nextRunAt,
                }
            );

        } else {

            // ====================================
            // Maximum Retry Reached
            // ====================================

            const nextRunAt =
                calculateNextRunAt({
                    postingTime:
                        automation.postingTime,

                    timezone:
                        automation.timezone,
                });


            await Automation.findByIdAndUpdate(
                automation._id,
                {
                    retryCount:
                        0,

                    retryAt:
                        null,

                    nextRunAt,

                    lastError:
                        error.message,

                    lastFailedAt:
                        new Date(),
                }
            );


            // ------------------------------------
            // Record Final Failed Status
            // ------------------------------------

            try {

                await recordExecutionStatus({
                    userId:
                        automation.userId,

                    automationId:
                        automation._id,

                    status:
                        "failed",

                    provider:
                        automation.llmProvider,
                });


                console.log(
                    "Execution status recorded:",
                    {
                        automationId:
                            automation._id,

                        status:
                            "failed",

                        provider:
                            automation.llmProvider,
                    }
                );

            } catch (
                statusError
            ) {

                console.error(
                    "Failed to record execution failure status:",
                    statusError
                );
            }


            console.log(
                "Automation failed after maximum retries:",
                {
                    automationId:
                        automation._id,

                    maxRetries:
                        MAX_RETRIES,

                    nextRunAt,
                }
            );
        }


        // ========================================
        // Let Scheduler / Controller Know
        // Execution Failed
        // ========================================

        throw error;
    }
};


export default executeAutomation;