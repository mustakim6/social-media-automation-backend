import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MAX_RETRIES = 3;

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const generateWithGemini = async (prompt) => {
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        throw new Error("Prompt is required");
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const interaction = await ai.interactions.create({
                model: "gemini-3.6-flash",
                input: prompt,
            });

            return interaction.output_text;
        } catch (error) {
            const status = error?.status;

            console.error(
                `Gemini request failed (attempt ${attempt}/${MAX_RETRIES}):`,
                error?.message
            );

            // Retry only for temporary server/rate-limit errors
            if (
                ![429, 500, 502, 503, 504].includes(status) ||
                attempt === MAX_RETRIES
            ) {
                throw error;
            }

            const retryDelay = attempt * 3000;

            console.log(
                `Retrying Gemini request in ${retryDelay / 1000} seconds...`
            );

            await sleep(retryDelay);
        }
    }
};

export default generateWithGemini;