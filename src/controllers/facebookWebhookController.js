import crypto from "crypto";

import {
    deactivateFacebookData,
    createDataDeletionResponse,
    getDataDeletionStatus,
} from "../services/facebookDataService.js";


// ==================================================
// Verify Meta Signed Request
// ==================================================

const verifyAndDecodeSignedRequest = (
    signedRequest
) => {
    if (!signedRequest) {
        throw new Error(
            "Signed request is missing"
        );
    }

    // ----------------------------------------------
    // Split signature and payload
    // ----------------------------------------------

    const parts =
        signedRequest.split(".");

    if (parts.length !== 2) {
        throw new Error(
            "Invalid signed request"
        );
    }

    const [
        encodedSignature,
        encodedPayload,
    ] = parts;

    // ----------------------------------------------
    // Decode signature
    // ----------------------------------------------

    const signature =
        Buffer.from(
            encodedSignature,
            "base64url"
        );

    // ----------------------------------------------
    // Decode payload
    // ----------------------------------------------

    const payloadString =
        Buffer.from(
            encodedPayload,
            "base64url"
        ).toString("utf8");

    let payload;

    try {
        payload =
            JSON.parse(
                payloadString
            );
    } catch (error) {
        throw new Error(
            "Invalid signed request payload"
        );
    }

    // ----------------------------------------------
    // Check algorithm
    // ----------------------------------------------

    if (
        payload.algorithm &&
        payload.algorithm.toUpperCase() !==
            "HMAC-SHA256"
    ) {
        throw new Error(
            "Unsupported signed request algorithm"
        );
    }

    // ----------------------------------------------
    // Generate expected signature
    // ----------------------------------------------

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.META_APP_SECRET
            )
            .update(
                encodedPayload
            )
            .digest();

    // ----------------------------------------------
    // Compare signatures safely
    // ----------------------------------------------

    if (
        signature.length !==
        expectedSignature.length
    ) {
        throw new Error(
            "Invalid signed request signature"
        );
    }

    const signatureValid =
        crypto.timingSafeEqual(
            signature,
            expectedSignature
        );

    if (!signatureValid) {
        throw new Error(
            "Invalid signed request signature"
        );
    }

    // ----------------------------------------------
    // Check Meta User ID
    // ----------------------------------------------

    if (!payload.user_id) {
        throw new Error(
            "Facebook user ID not found"
        );
    }

    return {
        userId: payload.user_id,
        payload,
    };
};


// ==================================================
// Deauthorize Callback
// ==================================================

const facebookDeauthorize = async (
    req,
    res
) => {
    try {
        const {
            signed_request:
                signedRequest,
        } = req.body;

        if (!signedRequest) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "signed_request is required",
            });
        }

        // ------------------------------------------
        // Verify Meta signed request
        // ------------------------------------------

        const {
            userId: metaUserId,
        } =
            verifyAndDecodeSignedRequest(
                signedRequest
            );

        console.log(
            "Facebook deauthorization received:",
            metaUserId
        );

        // ------------------------------------------
        // Deactivate SocialFlow Facebook data
        // ------------------------------------------

        const result =
            await deactivateFacebookData(
                metaUserId
            );

        return res.status(200).json({
            status: "OK",

            message:
                "Facebook authorization removed successfully",

            ...result,
        });
    } catch (error) {
        console.error(
            "Facebook deauthorization error:",
            error
        );

        return res.status(400).json({
            status: "ERR",
            message:
                error.message ||
                "Failed to process Facebook deauthorization",
        });
    }
};


// ==================================================
// Data Deletion Callback
// ==================================================

const facebookDataDeletion = async (
    req,
    res
) => {
    try {
        const {
            signed_request:
                signedRequest,
        } = req.body;

        if (!signedRequest) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "signed_request is required",
            });
        }

        // ------------------------------------------
        // Verify Meta signed request
        // ------------------------------------------

        const {
            userId: metaUserId,
        } =
            verifyAndDecodeSignedRequest(
                signedRequest
            );

        console.log(
            "Facebook data deletion request received:",
            metaUserId
        );

        // ------------------------------------------
        // Process deletion
        // ------------------------------------------

        const result =
            await createDataDeletionResponse(
                metaUserId
            );

        return res.status(200).json(
            result
        );
    } catch (error) {
        console.error(
            "Facebook data deletion error:",
            error
        );

        return res.status(400).json({
            status: "ERR",
            message:
                error.message ||
                "Failed to process Facebook data deletion request",
        });
    }
};


// ==================================================
// Data Deletion Status
// ==================================================

const facebookDataDeletionStatus = async (
    req,
    res
) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Confirmation code is required",
            });
        }

        // ------------------------------------------
        // Find deletion request
        // ------------------------------------------

        const deletionRequest =
            await getDataDeletionStatus(
                code
            );

        if (!deletionRequest) {
            return res.status(404).json({
                status: "ERR",
                message:
                    "Data deletion request not found",
            });
        }

        return res.status(200).json({
            status: "OK",

            data: deletionRequest,
        });
    } catch (error) {
        console.error(
            "Facebook data deletion status error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                error.message ||
                "Failed to get data deletion status",
        });
    }
};


// ==================================================
// Exports
// ==================================================

export {
    facebookDeauthorize,
    facebookDataDeletion,
    facebookDataDeletionStatus,
};