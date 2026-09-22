import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    getFacebookConnectionStatus,
    connectFacebook,
    facebookCallback,
    getFacebookPages,
    disconnectFacebookPage,
    getAvailableFacebookPages,
    connectSelectedFacebookPage,
    publishFacebookPost,
} from "../controllers/facebookController.js";
const router = express.Router();

router.get(
    "/status",
    authMiddleware,
    getFacebookConnectionStatus
);

router.get(
    "/connect",
    authMiddleware,
    connectFacebook
);

router.get(
    "/callback",
    facebookCallback
);

router.get(
    "/pages",
    authMiddleware,
    getFacebookPages
);

router.delete(
    "/pages/:pageId",
    authMiddleware,
    disconnectFacebookPage
);

router.get(
    "/available-pages",
    authMiddleware,
    getAvailableFacebookPages
);

router.post(
    "/pages",
    authMiddleware,
    connectSelectedFacebookPage
);

router.post(
    "/publish",
    authMiddleware,
    publishFacebookPost
);

export default router;