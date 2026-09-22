import generateImageWithGemini
    from "./geminiImageProvider.js";


const generateImage = async ({
    provider,
    prompt,
}) => {

    // --------------------------------------------------
    // Validate provider
    // --------------------------------------------------

    if (!provider) {
        throw new Error(
            "Image provider is required"
        );
    }


    // --------------------------------------------------
    // Validate image prompt
    // --------------------------------------------------

    if (
        !prompt ||
        typeof prompt !== "string" ||
        !prompt.trim()
    ) {
        throw new Error(
            "Image prompt is required"
        );
    }


    // --------------------------------------------------
    // Select image provider
    // --------------------------------------------------

    switch (provider) {

        case "gemini":

            return await generateImageWithGemini(
                prompt
            );


        default:

            throw new Error(
                `Unsupported image provider: ${provider}`
            );
    }
};


export default generateImage;