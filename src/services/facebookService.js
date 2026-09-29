import jwt from "jsonwebtoken";

const META_GRAPH_VERSION =
    process.env.META_GRAPH_VERSION || "v24.0";


// ----------------------------------------
// Facebook OAuth State
// ----------------------------------------

const createFacebookOAuthState = (userId) => {
    return jwt.sign(
        {
            userId,
            purpose: "facebook-oauth",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10m",
        }
    );
};


// ----------------------------------------
// Facebook OAuth URL
// ----------------------------------------

const createFacebookAuthUrl = (state) => {
    const params = new URLSearchParams({
        client_id: process.env.META_APP_ID,

        redirect_uri:
            process.env.META_REDIRECT_URI,

        scope: [
            "pages_show_list",
            "pages_manage_posts",
            "pages_read_engagement",
        ].join(","),

        response_type: "code",

        state,
    });

    return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
};


// ----------------------------------------
// Exchange OAuth Code
// ----------------------------------------

const exchangeCodeForUserAccessToken = async (
    code
) => {
    const params = new URLSearchParams({
        client_id:
            process.env.META_APP_ID,

        client_secret:
            process.env.META_APP_SECRET,

        redirect_uri:
            process.env.META_REDIRECT_URI,

        code,
    });

    const response = await fetch(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?${params.toString()}`
    );

    const data =
        await response.json();

    if (!response.ok) {
        console.error(
            "Meta token exchange failed:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Failed to exchange authorization code"
        );
    }

    return data;
};


// ----------------------------------------
// Fetch Facebook Pages
// ----------------------------------------

const fetchFacebookPages = async (
    userAccessToken
) => {
    const params = new URLSearchParams({
        fields:
            "id,name,access_token",

        access_token:
            userAccessToken,
    });

    const response = await fetch(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?${params.toString()}`
    );

    const data =
        await response.json();

    if (!response.ok) {
        console.error(
            "Meta page fetch failed:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Failed to fetch Facebook Pages"
        );
    }

    return data;
};


// ----------------------------------------
// Publish Text Post
// ----------------------------------------

const publishToFacebookPage = async ({
    pageId,
    pageAccessToken,
    message,
}) => {
    if (!pageId) {
        throw new Error(
            "Facebook Page ID is required"
        );
    }

    if (!pageAccessToken) {
        throw new Error(
            "Facebook Page access token is required"
        );
    }

    if (!message) {
        throw new Error(
            "Message is required"
        );
    }

    const params = new URLSearchParams({
        message,
        access_token:
            pageAccessToken,
    });

    const response = await fetch(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/feed`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },

            body: params,
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        console.error(
            "Facebook publish failed:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Failed to publish post to Facebook"
        );
    }

    return data;
};


// ----------------------------------------
// Publish Photo / Card to Facebook Page
// ----------------------------------------

const publishPhotoToFacebookPage = async ({
    pageId,
    pageAccessToken,
    imageBuffer,
    caption = "",
}) => {
    if (!pageId) {
        throw new Error(
            "Facebook Page ID is required"
        );
    }

    if (!pageAccessToken) {
        throw new Error(
            "Facebook Page access token is required"
        );
    }

    if (
        !imageBuffer ||
        !Buffer.isBuffer(imageBuffer)
    ) {
        throw new Error(
            "Image buffer is required"
        );
    }

    const formData =
        new FormData();

    const imageBlob =
        new Blob(
            [imageBuffer],
            {
                type: "image/png",
            }
        );

    formData.append(
        "source",
        imageBlob,
        "card.png"
    );

    if (
        caption &&
        typeof caption === "string"
    ) {
        formData.append(
            "caption",
            caption
        );
    }

    formData.append(
        "access_token",
        pageAccessToken
    );

    const response =
        await fetch(
            `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/photos`,
            {
                method: "POST",
                body: formData,
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        console.error(
            "Facebook photo publish failed:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Failed to publish photo to Facebook"
        );
    }

    return data;
};


// ----------------------------------------
// Fetch Meta User
// ----------------------------------------

const fetchFacebookUser = async (
    userAccessToken
) => {
    const params = new URLSearchParams({
        fields: "id,name",

        access_token:
            userAccessToken,
    });

    const response = await fetch(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/me?${params.toString()}`
    );

    const data =
        await response.json();

    if (!response.ok) {
        console.error(
            "Meta user fetch failed:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Failed to fetch Meta user"
        );
    }

    return data;
};


// ----------------------------------------
// Exports
// ----------------------------------------

export {
    createFacebookOAuthState,
    createFacebookAuthUrl,
    exchangeCodeForUserAccessToken,
    fetchFacebookPages,
    fetchFacebookUser,
    publishToFacebookPage,
    publishPhotoToFacebookPage,
};