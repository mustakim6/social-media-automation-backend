import renderCard from "../services/card/cardRenderer.js";

const CARD_THEMES = [
    "midnight",
    "ocean",
    "forest",
    "berry",
    "sunset",
    "royal",
    "teal",
];

const testCardGeneration = async (
    req,
    res
) => {
    try {

        const {
            text,
            pageName,
            theme = "midnight",
        } = req.body;


        // --------------------------------
        // Validate text
        // --------------------------------

        if (
            !text ||
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Text is required",
            });
        }


        // --------------------------------
        // Validate page name
        // --------------------------------

        if (
            !pageName ||
            typeof pageName !== "string" ||
            !pageName.trim()
        ) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Page name is required",
            });
        }


        // --------------------------------
        // Validate theme
        // --------------------------------

        if (
            !CARD_THEMES.includes(
                theme
            )
        ) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Invalid card theme",
            });
        }


        // --------------------------------
        // Generate card
        // --------------------------------

        const imageBuffer =
            await renderCard({
                text:
                    text.trim(),

                pageName:
                    pageName.trim(),

                theme,
            });


        // --------------------------------
        // Return PNG
        // --------------------------------

        res.set({
            "Content-Type":
                "image/png",

            "Content-Length":
                imageBuffer.length,
        });


        return res.status(200).send(
            imageBuffer
        );

    } catch (error) {

        console.error(
            "Card generation test error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                "Failed to generate card",
        });
    }
};

export default testCardGeneration;