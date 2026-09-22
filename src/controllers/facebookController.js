import jwt from "jsonwebtoken";
import FacebookPage from "../models/FacebookPage.js";
import FacebookOAuthSession from "../models/FacebookOAuthSession.js";

import {
    createFacebookOAuthState,
    createFacebookAuthUrl,
    exchangeCodeForUserAccessToken,
    fetchFacebookPages,
    publishToFacebookPage,
} from "../services/facebookService.js";


// Check Facebook connection status
const getFacebookConnectionStatus = (req, res) => {
    return res.status(200).json({
        status: "OK",
        connected: false,
        message: "Facebook integration is ready",
    });
};


// Start Facebook OAuth flow
const connectFacebook = (req, res) => {
    const state = createFacebookOAuthState(req.userId);

    const authUrl = createFacebookAuthUrl(state);

    return res.redirect(authUrl);
};


// Facebook OAuth callback
const facebookCallback = async (req, res) => {
    const { code, state } = req.query;

    // Check authorization code
    if (!code) {
        return res.status(400).json({
            status: "ERR",
            message: "Authorization code not found",
        });
    }

    // Check OAuth state
    if (!state) {
        return res.status(400).json({
            status: "ERR",
            message: "OAuth state not found",
        });
    }

    try {
        // Verify OAuth state
        const decodedState = jwt.verify(
            state,
            process.env.JWT_SECRET
        );

        // Make sure this state belongs to Facebook OAuth
        if (decodedState.purpose !== "facebook-oauth") {
            return res.status(400).json({
                status: "ERR",
                message: "Invalid OAuth state",
            });
        }

        // Exchange authorization code for user access token
        const tokenData = await exchangeCodeForUserAccessToken(code);

        console.log("Meta token received successfully");
        console.log(
            "OAuth belongs to user:",
            decodedState.userId
        );

        // Get Facebook Pages
        const pagesData = await fetchFacebookPages(
            tokenData.access_token
        );

        const pages = pagesData.data;

        console.log(
            "Facebook Pages received:",
            pages?.length || 0
        );

        // Check if user has any Facebook Page
        if (!pages || pages.length === 0) {
            return res.status(404).json({
                status: "ERR",
                message: "No Facebook Pages found",
            });
        }

        // Prepare Pages for temporary storage
        const availablePages = pages.map((page) => ({
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
        }));

        // Create expiry time
        // OAuth selection session will be valid for 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Save temporary OAuth session
        const oauthSession = await FacebookOAuthSession.create({
            userId: decodedState.userId,
            pages: availablePages,
            expiresAt,
        });

        console.log("Facebook OAuth session created:", {
            sessionId: oauthSession._id,
            userId: oauthSession.userId,
            pageCount: oauthSession.pages.length,
            expiresAt: oauthSession.expiresAt,
        });

        return res.redirect(
    `${process.env.FRONTEND_URL}/pages?facebook=connected&sessionId=${oauthSession._id}`

);

    } catch (error) {
        console.error(
            "Facebook callback error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message: "Facebook authorization failed",
        });
    }
};

// Get connected Facebook Pages of current user
const getFacebookPages = async (req, res) => {
    try {
        const pages = await FacebookPage.find({
            userId: req.userId,
            isActive: true,
        }).select(
            "_id pageId pageName isActive connectedAt createdAt updatedAt"
        );


        return res.status(200).json({
            status: "OK",
            pages,
        });

    } catch (error) {
        console.error("Get Facebook Pages error:", error);

        return res.status(500).json({
            status: "ERR",
            message: "Failed to get Facebook Pages",
        });
    }
};

const disconnectFacebookPage = async (req, res) => {
    try {
        const { pageId } = req.params;

        const page = await FacebookPage.findOneAndUpdate(
            {
                userId: req.userId,
                pageId: pageId,
                isActive: true,
            },
            {
                isActive: false,
            },
            {
                returnDocument: "after",
            }
        );

        if (!page) {
            return res.status(404).json({
                status: "ERR",
                message: "Facebook Page not found",
            });
        }

        return res.status(200).json({
            status: "OK",
            message: "Facebook Page disconnected successfully",
        });

    } catch (error) {
        console.error("Disconnect Facebook Page error:", error);

        return res.status(500).json({
            status: "ERR",
            message: "Failed to disconnect Facebook Page",
        });
    }
};

const getAvailableFacebookPages = async (req, res) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({
                status: "ERR",
                message: "sessionId is required",
            });
        }

        const oauthSession = await FacebookOAuthSession.findOne({
            _id: sessionId,
            userId: req.userId,
            expiresAt: { $gt: new Date() },
        });

        if (!oauthSession) {
            return res.status(404).json({
                status: "ERR",
                message: "Facebook session expired or not found",
            });
        }

        const pages = oauthSession.pages.map((page) => ({
            pageId: page.pageId,
            pageName: page.pageName,
        }));

        return res.status(200).json({
            status: "OK",
            sessionId: oauthSession._id,
            pages,
        });

    } catch (error) {
        console.error(
            "Get available Facebook Pages error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message: "Failed to get available Facebook Pages",
        });
    }
};

const connectSelectedFacebookPage = async (req, res) => {
    try {
        const { sessionId, pageId } = req.body;

        // Validate request
        if (!sessionId || !pageId) {
            return res.status(400).json({
                status: "ERR",
                message: "sessionId and pageId are required",
            });
        }

        // Find current user's OAuth session
        const oauthSession = await FacebookOAuthSession.findOne({
            _id: sessionId,
            userId: req.userId,
            expiresAt: { $gt: new Date() },
        });

        if (!oauthSession) {
            return res.status(404).json({
                status: "ERR",
                message: "Facebook session expired or not found",
            });
        }

        // Find selected Page inside OAuth session
        const selectedPage = oauthSession.pages.find(
            (page) => page.pageId === pageId
        );

        if (!selectedPage) {
            return res.status(404).json({
                status: "ERR",
                message: "Selected Facebook Page not found",
            });
        }

        // Save or update selected Page
        const savedPage = await FacebookPage.findOneAndUpdate(
            {
                userId: req.userId,
                pageId: selectedPage.pageId,
            },
            {
                userId: req.userId,
                pageId: selectedPage.pageId,
                pageName: selectedPage.pageName,
                pageAccessToken: selectedPage.pageAccessToken,
                isActive: true,
                connectedAt: new Date(),
            },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true,
            }
        );

        // Delete temporary OAuth session
        await FacebookOAuthSession.deleteOne({
            _id: oauthSession._id,
        });

        console.log("Facebook Page connected:", {
            id: savedPage._id,
            pageId: savedPage.pageId,
            pageName: savedPage.pageName,
        });

        return res.status(200).json({
            status: "OK",
            message: "Facebook Page connected successfully",
            page: {
                id: savedPage._id,
                pageId: savedPage.pageId,
                pageName: savedPage.pageName,
                isActive: savedPage.isActive,
                connectedAt: savedPage.connectedAt,
            },
        });

    } catch (error) {
        console.error(
            "Connect selected Facebook Page error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message: "Failed to connect Facebook Page",
        });
    }
};

const publishFacebookPost = async (req, res) => {
    try {
        const {
            facebookPageId,
            message,
        } = req.body;

        if (!facebookPageId || !message) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "facebookPageId and message are required",
            });
        }

        const page = await FacebookPage.findOne({
            _id: facebookPageId,
            userId: req.userId,
            isActive: true,
        });

        if (!page) {
            return res.status(404).json({
                status: "ERR",
                message: "Facebook Page not found",
            });
        }

        const result =
            await publishToFacebookPage({
                pageId: page.pageId,
                pageAccessToken:
                    page.pageAccessToken,
                message,
            });

        return res.status(200).json({
            status: "OK",
            message:
                "Facebook post published successfully",
            postId: result.id,
        });

    } catch (error) {
        console.error(
            "Publish Facebook post error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                error.message ||
                "Failed to publish Facebook post",
        });
    }
};

export {
    getFacebookConnectionStatus,
    connectFacebook,
    facebookCallback,
    getFacebookPages,
    disconnectFacebookPage,
    getAvailableFacebookPages,
    connectSelectedFacebookPage,
    publishFacebookPost,
};