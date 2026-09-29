import crypto from "crypto";

import FacebookPage from "../models/FacebookPage.js";
import FacebookOAuthSession from "../models/FacebookOAuthSession.js";
import FacebookDataDeletionRequest from "../models/FacebookDataDeletionRequest.js";
import User from "../models/User.js";

const generateConfirmationCode = () => {
    return crypto
        .randomBytes(16)
        .toString("hex");
};

const findUserByMetaUserId = async (
    metaUserId
) => {
    if (!metaUserId) {
        throw new Error(
            "Meta User ID is required"
        );
    }

    const user = await User.findOne({
        metaUserId,
    });

    return user;
};

const deactivateFacebookData = async (
    metaUserId
) => {
    if (!metaUserId) {
        throw new Error(
            "Meta User ID is required"
        );
    }

    const user =
        await findUserByMetaUserId(
            metaUserId
        );

    if (!user) {
        return {
            userFound: false,
            pagesDeactivated: 0,
            sessionsDeleted: 0,
        };
    }

    const pageResult =
        await FacebookPage.updateMany(
            {
                userId: user._id,
                isActive: true,
            },
            {
                $set: {
                    isActive: false,
                },
            }
        );

    const sessionResult =
        await FacebookOAuthSession.deleteMany(
            {
                userId: user._id,
            }
        );

    return {
        userFound: true,
        userId: user._id,
        metaUserId,
        pagesDeactivated:
            pageResult.modifiedCount || 0,
        sessionsDeleted:
            sessionResult.deletedCount || 0,
    };
};

const createDataDeletionResponse = async (
    metaUserId
) => {
    const deletionResult =
        await deactivateFacebookData(
            metaUserId
        );

    const confirmationCode =
        generateConfirmationCode();

    await FacebookDataDeletionRequest.create(
        {
            confirmationCode,
            userId:
                deletionResult.userId ||
                null,
            metaUserId,
            status: "completed",
            requestedAt: new Date(),
            completedAt: new Date(),
        }
    );

    return {
        confirmationCode,
        url:
            `${process.env.FRONTEND_URL}/data-deletion?code=${confirmationCode}`,
        ...deletionResult,
    };
};

const getDataDeletionStatus = async (
    confirmationCode
) => {
    if (!confirmationCode) {
        throw new Error(
            "Confirmation code is required"
        );
    }

    const deletionRequest =
        await FacebookDataDeletionRequest.findOne(
            {
                confirmationCode,
            }
        ).select(
            "confirmationCode status requestedAt completedAt"
        );

    return deletionRequest;
};

export {
    deactivateFacebookData,
    createDataDeletionResponse,
    getDataDeletionStatus,
};