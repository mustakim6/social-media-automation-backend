import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


const generateImageWithGemini = async (
    imagePrompt
) => {

    // --------------------------------------------------
    // Validate prompt
    // --------------------------------------------------

    if (
        !imagePrompt ||
        typeof imagePrompt !== "string" ||
        !imagePrompt.trim()
    ) {
        throw new Error(
            "Image prompt is required"
        );
    }


    // --------------------------------------------------
    // Generate image with Gemini
    // --------------------------------------------------

    const interaction =
        await ai.interactions.create({
            model:
                "gemini-3.1-flash-image",

            input: imagePrompt.trim(),

            response_format: {
                type: "image",

                // Gemini currently accepts JPEG
                // for this configuration.
                mime_type: "image/jpeg",

                aspect_ratio: "1:1",

                image_size: "1K",
            },
        });


    // --------------------------------------------------
    // Validate Gemini response
    // --------------------------------------------------

    const generatedImage =
        interaction.output_image;

    if (
        !generatedImage ||
        !generatedImage.data
    ) {
        throw new Error(
            "Gemini did not return an image"
        );
    }


    // --------------------------------------------------
    // Return generated image
    // --------------------------------------------------

    return {
        data: generatedImage.data,

        mimeType:
            generatedImage.mime_type ||
            "image/jpeg",
    };
};


export default generateImageWithGemini;