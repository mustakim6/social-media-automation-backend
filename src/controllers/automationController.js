import Automation from "../models/Automation.js";

import {
    createAutomation as createAutomationService,
    getUserAutomations,
    getAutomationById,
    updateAutomation as updateAutomationService,
    deleteAutomation as deleteAutomationService,
} from "../services/automationService.js";

import executeAutomation from "../services/automationExecutionService.js";

import {
    validateCreateAutomation,
    validateUpdateAutomation,
    validateAutomationId,
} from "../validators/automationValidator.js";


// ================================================
// CREATE AUTOMATION
// ================================================

const createAutomation = async (req, res) => {
    try {
        const {
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
        } = req.body;


        // --------------------------------
        // Validate request
        // --------------------------------

        const validationError =
            validateCreateAutomation({
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
            });


        if (validationError) {
            return res.status(400).json({
                status: "ERR",
                message: validationError,
            });
        }


        // --------------------------------
        // Create automation
        // --------------------------------

        const automation =
            await createAutomationService({
                userId: req.userId,

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
            });


        return res.status(201).json({
            status: "OK",

            message:
                "Automation created successfully",

            automation,
        });

    } catch (error) {
        console.error(
            "Create automation error:",
            error
        );

        return res.status(500).json({
            status: "ERR",

            message:
                error.message ||
                "Failed to create automation",
        });
    }
};


// ================================================
// GET USER AUTOMATIONS
// ================================================

const getAutomations = async (req, res) => {
    try {
        const automations =
            await getUserAutomations(
                req.userId
            );

        return res.status(200).json({
            status: "OK",
            automations,
        });

    } catch (error) {
        console.error(
            "Get automations error:",
            error
        );

        return res.status(500).json({
            status: "ERR",

            message:
                error.message ||
                "Failed to fetch automations",
        });
    }
};


// ================================================
// GET SINGLE AUTOMATION
// ================================================

const getAutomation = async (req, res) => {
    try {
        const {
            automationId,
        } = req.params;


        // --------------------------------
        // Validate automation ID
        // --------------------------------

        const validationError =
            validateAutomationId(
                automationId
            );


        if (validationError) {
            return res.status(400).json({
                status: "ERR",
                message: validationError,
            });
        }


        // --------------------------------
        // Get automation
        // --------------------------------

        const automation =
            await getAutomationById({
                automationId,

                userId:
                    req.userId,
            });


        return res.status(200).json({
            status: "OK",
            automation,
        });

    } catch (error) {
        console.error(
            "Get automation error:",
            error
        );


        if (
            error.message ===
            "Automation not found"
        ) {
            return res.status(404).json({
                status: "ERR",
                message: error.message,
            });
        }


        return res.status(500).json({
            status: "ERR",

            message:
                error.message ||
                "Failed to fetch automation",
        });
    }
};


// ================================================
// UPDATE AUTOMATION
// ================================================

const updateAutomation = async (req, res) => {
    try {
        const {
            automationId,
        } = req.params;


        // --------------------------------
        // Validate automation ID
        // --------------------------------

        const automationIdError =
            validateAutomationId(
                automationId
            );


        if (automationIdError) {
            return res.status(400).json({
                status: "ERR",

                message:
                    automationIdError,
            });
        }


        // --------------------------------
        // Request body
        // --------------------------------

        const {
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
        } = req.body;


        // --------------------------------
        // Validate request
        // --------------------------------

        const validationError =
            validateUpdateAutomation({
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
            });


        if (validationError) {
            return res.status(400).json({
                status: "ERR",

                message:
                    validationError,
            });
        }


        // --------------------------------
        // Update automation
        // --------------------------------

        const automation =
            await updateAutomationService({
                automationId,

                userId:
                    req.userId,

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
            });


        return res.status(200).json({
            status: "OK",

            message:
                "Automation updated successfully",

            automation,
        });

    } catch (error) {
        console.error(
            "Update automation error:",
            error
        );


        if (
            error.message ===
                "Automation not found" ||

            error.message ===
                "Facebook Page not found"
        ) {
            return res.status(404).json({
                status: "ERR",

                message:
                    error.message,
            });
        }


        return res.status(500).json({
            status: "ERR",

            message:
                error.message ||
                "Failed to update automation",
        });
    }
};


// ================================================
// DELETE AUTOMATION
// ================================================

const deleteAutomation = async (req, res) => {
    try {
        const {
            automationId,
        } = req.params;


        // --------------------------------
        // Validate automation ID
        // --------------------------------

        const validationError =
            validateAutomationId(
                automationId
            );


        if (validationError) {
            return res.status(400).json({
                status: "ERR",
                message: validationError,
            });
        }


        // --------------------------------
        // Delete automation
        // --------------------------------

        await deleteAutomationService({
            automationId,

            userId:
                req.userId,
        });


        return res.status(200).json({
            status: "OK",

            message:
                "Automation deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete automation error:",
            error
        );


        if (
            error.message ===
            "Automation not found"
        ) {
            return res.status(404).json({
                status: "ERR",
                message: error.message,
            });
        }


        return res.status(500).json({
            status: "ERR",

            message:
                error.message ||
                "Failed to delete automation",
        });
    }
};


// ================================================
// MANUAL RUN AUTOMATION
// ================================================

const runAutomation = async (req, res) => {
    try {
        const {
            automationId,
        } = req.params;


        // --------------------------------
        // Validate automation ID
        // --------------------------------

        const validationError =
            validateAutomationId(
                automationId
            );


        if (validationError) {
            return res.status(400).json({
                status: "ERR",

                message:
                    validationError,
            });
        }


        // --------------------------------
        // Get automation
        // --------------------------------

        const automation =
            await getAutomationById({
                automationId,

                userId:
                    req.userId,
            });


        // --------------------------------
        // Check running state
        // --------------------------------

        if (
            automation.isRunning
        ) {
            return res.status(409).json({
                status: "ERR",

                message:
                    "Automation is already running",
            });
        }


        // --------------------------------
        // Claim automation
        // --------------------------------

        const claimedAutomation =
            await Automation.findOneAndUpdate(
                {
                    _id:
                        automationId,

                    userId:
                        req.userId,

                    isActive:
                        true,

                    isRunning:
                        false,
                },
                {
                    $set: {
                        isRunning:
                            true,
                    },
                },
                {
                    returnDocument:
                        "after",
                }
            );


        if (!claimedAutomation) {
            return res.status(409).json({
                status: "ERR",

                message:
                    "Automation is already running or inactive",
            });
        }


        // --------------------------------
        // Execute automation
        // --------------------------------

        try {
            await executeAutomation(
                claimedAutomation
            );

        } finally {

            // --------------------------------
            // Always release running lock
            // --------------------------------

            await Automation.findByIdAndUpdate(
                automationId,
                {
                    $set: {
                        isRunning:
                            false,
                    },
                }
            );
        }


        return res.status(200).json({
            status: "OK",

            message:
                "Automation executed successfully",
        });

    } catch (error) {
        console.error(
            "Manual automation execution error:",
            error
        );


        if (
            error.message ===
            "Automation not found"
        ) {
            return res.status(404).json({
                status: "ERR",
                message: error.message,
            });
        }


        return res.status(500).json({
            status: "ERR",

            message:
                error.message ||
                "Automation execution failed",
        });
    }
};


// ================================================
// EXPORT
// ================================================

export {
    createAutomation,
    getAutomations,
    getAutomation,
    updateAutomation,
    deleteAutomation,
    runAutomation,
};