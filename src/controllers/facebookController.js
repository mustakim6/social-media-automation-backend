import jwt from "jsonwebtoken";

import FacebookPage from "../models/FacebookPage.js";
import FacebookOAuthSession from "../models/FacebookOAuthSession.js";
import User from "../models/User.js";

import {
    createFacebookOAuthState,
    createFacebookAuthUrl,
    exchangeCodeForUserAccessToken,
    fetchFacebookPages,
    fetchFacebookUser,
    publishToFacebookPage,
} from "../services/facebookService.js";


// ======================================================
// Check Facebook Connection Status
// ======================================================

const getFacebookConnectionStatus = async (req, res) => {
    try {
        const pages = await FacebookPage.find({
            userId: req.userId,
            isActive: true,
        }).select("_id pageId pageName isActive connectedAt");

        return res.status(200).json({
            status: "OK",
            connected: pages.length > 0,
            pages,
        });
    } catch (error) {
        console.error(
            "Get Facebook connection status error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to get Facebook connection status",
        });
    }
};


// ======================================================
// Start Facebook OAuth Flow
// ======================================================

const connectFacebook = (req, res) => {
    try {
        const state = createFacebookOAuthState(
            req.userId
        );

        const authUrl = createFacebookAuthUrl(state);

        return res.redirect(authUrl);
    } catch (error) {
        console.error(
            "Connect Facebook error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to start Facebook authorization",
        });
    }
};


// ======================================================
// Facebook OAuth Callback
// ======================================================

const facebookCallback = async (req, res) => {
    const { code, state } = req.query;

    // -----------------------------------------------
    // Validate code
    // -----------------------------------------------

    if (!code) {
        return res.status(400).json({
            status: "ERR",
            message: "Authorization code not found",
        });
    }

    // -----------------------------------------------
    // Validate state
    // -----------------------------------------------

    if (!state) {
        return res.status(400).json({
            status: "ERR",
            message: "OAuth state not found",
        });
    }

    try {
        // -------------------------------------------
        // Verify OAuth state
        // -------------------------------------------

        const decodedState = jwt.verify(
            state,
            process.env.JWT_SECRET
        );

        if (
            decodedState.purpose !==
            "facebook-oauth"
        ) {
            return res.status(400).json({
                status: "ERR",
                message: "Invalid OAuth state",
            });
        }

        if (!decodedState.userId) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "User ID not found in OAuth state",
            });
        }

        // -------------------------------------------
        // Exchange authorization code
        // for Meta user access token
        // -------------------------------------------

        const tokenData =
            await exchangeCodeForUserAccessToken(
                code
            );

        if (!tokenData?.access_token) {
            throw new Error(
                "Meta user access token not received"
            );
        }

        console.log(
            "Meta token received successfully"
        );

        console.log(
            "OAuth belongs to user:",
            decodedState.userId
        );

        // -------------------------------------------
        // Fetch Meta/Facebook User
        // -------------------------------------------

        const metaUser =
            await fetchFacebookUser(
                tokenData.access_token
            );

        if (!metaUser?.id) {
            throw new Error(
                "Meta user ID not found"
            );
        }

        console.log(
            "Meta user received:",
            {
                id: metaUser.id,
                name: metaUser.name,
            }
        );

        // -------------------------------------------
        // Fetch Facebook Pages
        // -------------------------------------------

        const pagesData =
            await fetchFacebookPages(
                tokenData.access_token
            );

        const pages = pagesData?.data || [];

        console.log(
            "Facebook Pages received:",
            pages.length
        );

        // -------------------------------------------
        // If no Facebook Page found
        // -------------------------------------------

        if (pages.length === 0) {
            return res.status(404).json({
                status: "ERR",
                message:
                    "No Facebook Pages found",
            });
        }

        // -------------------------------------------
        // Save Meta user ID
        // -------------------------------------------

        const updatedUser =
            await User.findByIdAndUpdate(
                decodedState.userId,
                {
                    metaUserId: metaUser.id,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!updatedUser) {
            return res.status(404).json({
                status: "ERR",
                message: "SocialFlow user not found",
            });
        }

        console.log(
            "Meta user ID saved:",
            metaUser.id
        );

        // -------------------------------------------
        // Prepare available Facebook Pages
        // -------------------------------------------

        const availablePages = pages.map(
            (page) => ({
                pageId: page.id,
                pageName: page.name,
                pageAccessToken:
                    page.access_token,
            })
        );

        // -------------------------------------------
        // Create temporary OAuth session
        // -------------------------------------------

        const expiresAt = new Date(
            Date.now() +
                10 * 60 * 1000
        );

        const oauthSession =
            await FacebookOAuthSession.create({
                userId: decodedState.userId,
                pages: availablePages,
                expiresAt,
            });

        console.log(
            "Facebook OAuth session created:",
            {
                sessionId:
                    oauthSession._id,
                userId:
                    oauthSession.userId,
                pageCount:
                    oauthSession.pages.length,
                expiresAt:
                    oauthSession.expiresAt,
            }
        );

        // -------------------------------------------
        // Redirect frontend
        // -------------------------------------------

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
            message:
                error.message ||
                "Facebook authorization failed",
        });
    }
};


// ======================================================
// Get Connected Facebook Pages
// ======================================================

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
        console.error(
            "Get Facebook Pages error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to get Facebook Pages",
        });
    }
};


// ======================================================
// Disconnect Facebook Page
// ======================================================

const disconnectFacebookPage = async (
    req,
    res
) => {
    try {
        const { pageId } = req.params;

        if (!pageId) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Facebook Page ID is required",
            });
        }

        const page =
            await FacebookPage.findOneAndUpdate(
                {
                    userId: req.userId,
                    pageId,
                    isActive: true,
                },
                {
                    $set: {
                        isActive: false,
                    },
                },
                {
                    new: true,
                }
            );

        if (!page) {
            return res.status(404).json({
                status: "ERR",
                message:
                    "Facebook Page not found",
            });
        }

        return res.status(200).json({
            status: "OK",
            message:
                "Facebook Page disconnected successfully",
        });
    } catch (error) {
        console.error(
            "Disconnect Facebook Page error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to disconnect Facebook Page",
        });
    }
};


// ======================================================
// Get Available Facebook Pages
// From Temporary OAuth Session
// ======================================================

const getAvailableFacebookPages = async (
    req,
    res
) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "sessionId is required",
            });
        }

        const oauthSession =
            await FacebookOAuthSession.findOne({
                _id: sessionId,
                userId: req.userId,
                expiresAt: {
                    $gt: new Date(),
                },
            });

        if (!oauthSession) {
            return res.status(404).json({
                status: "ERR",
                message:
                    "Facebook session expired or not found",
            });
        }

        const pages =
            oauthSession.pages.map(
                (page) => ({
                    pageId: page.pageId,
                    pageName: page.pageName,
                })
            );

        return res.status(200).json({
            status: "OK",
            sessionId:
                oauthSession._id,
            pages,
        });
    } catch (error) {
        console.error(
            "Get available Facebook Pages error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to get available Facebook Pages",
        });
    }
};


// ======================================================
// Connect Selected Facebook Page
// ======================================================

const connectSelectedFacebookPage =
    async (req, res) => {
        try {
            const {
                sessionId,
                pageId,
            } = req.body;

            // -------------------------------------------
            // Validate input
            // -------------------------------------------

            if (!sessionId || !pageId) {
                return res.status(400).json({
                    status: "ERR",
                    message:
                        "sessionId and pageId are required",
                });
            }

            // -------------------------------------------
            // Find valid OAuth session
            // -------------------------------------------

            const oauthSession =
                await FacebookOAuthSession.findOne({
                    _id: sessionId,
                    userId: req.userId,
                    expiresAt: {
                        $gt: new Date(),
                    },
                });

            if (!oauthSession) {
                return res.status(404).json({
                    status: "ERR",
                    message:
                        "Facebook session expired or not found",
                });
            }

            // -------------------------------------------
            // Find selected page
            // -------------------------------------------

            const selectedPage =
                oauthSession.pages.find(
                    (page) =>
                        page.pageId ===
                        pageId
                );

            if (!selectedPage) {
                return res.status(404).json({
                    status: "ERR",
                    message:
                        "Selected Facebook Page not found",
                });
            }

            // -------------------------------------------
            // Save / Reactivate Facebook Page
            // -------------------------------------------

            const savedPage =
                await FacebookPage.findOneAndUpdate(
                    {
                        userId: req.userId,
                        pageId:
                            selectedPage.pageId,
                    },
                    {
                        $set: {
                            userId:
                                req.userId,
                            pageId:
                                selectedPage.pageId,
                            pageName:
                                selectedPage.pageName,
                            pageAccessToken:
                                selectedPage.pageAccessToken,
                            isActive: true,
                            connectedAt:
                                new Date(),
                        },
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                    }
                );

            // -------------------------------------------
            // Delete temporary OAuth session
            // -------------------------------------------

            await FacebookOAuthSession.deleteOne(
                {
                    _id:
                        oauthSession._id,
                }
            );

            console.log(
                "Facebook Page connected:",
                {
                    id:
                        savedPage._id,
                    pageId:
                        savedPage.pageId,
                    pageName:
                        savedPage.pageName,
                }
            );

            return res.status(200).json({
                status: "OK",
                message:
                    "Facebook Page connected successfully",
                page: {
                    id:
                        savedPage._id,
                    pageId:
                        savedPage.pageId,
                    pageName:
                        savedPage.pageName,
                    isActive:
                        savedPage.isActive,
                    connectedAt:
                        savedPage.connectedAt,
                },
            });
        } catch (error) {
            console.error(
                "Connect selected Facebook Page error:",
                error
            );

            return res.status(500).json({
                status: "ERR",
                message:
                    "Failed to connect Facebook Page",
            });
        }
    };


// ======================================================
// Publish Facebook Post
// ======================================================

const publishFacebookPost = async (
    req,
    res
) => {
    try {
        const {
            facebookPageId,
            message,
        } = req.body;

        // -------------------------------------------
        // Validate input
        // -------------------------------------------

        if (
            !facebookPageId ||
            !message
        ) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "facebookPageId and message are required",
            });
        }

        // -------------------------------------------
        // Find user's active Facebook Page
        // -------------------------------------------

        const page =
            await FacebookPage.findOne({
                _id: facebookPageId,
                userId: req.userId,
                isActive: true,
            });

        if (!page) {
            return res.status(404).json({
                status: "ERR",
                message:
                    "Facebook Page not found",
            });
        }

        // -------------------------------------------
        // Publish to Facebook
        // -------------------------------------------

        const result =
            await publishToFacebookPage({
                pageId:
                    page.pageId,
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


// ======================================================
// Exports
// ======================================================

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