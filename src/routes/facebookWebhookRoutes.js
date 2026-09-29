import express from "express";

import {
    facebookDeauthorize,
    facebookDataDeletion,
    facebookDataDeletionStatus,
} from "../controllers/facebookWebhookController.js";


const router = express.Router();


// ==================================================
// Meta Deauthorize Callback
// ==================================================

router.post(
    "/deauthorize",
    facebookDeauthorize
);


// ==================================================
// Meta Data Deletion Callback
// ==================================================

router.post(
    "/data-deletion",
    facebookDataDeletion
);


// ==================================================
// Data Deletion Status
// ==================================================

router.get(
    "/data-deletion-status/:code",
    facebookDataDeletionStatus
);


export default router;