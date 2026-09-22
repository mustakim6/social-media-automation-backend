import generateWithOpenAI
    from "./openaiProvider.js";

import generateWithGemini
    from "./geminiProvider.js";


const generatePost = async ({
    provider,
    prompt,
}) => {

    if (!provider) {
        throw new Error("LLM provider is required");
    }

    if (!prompt) {
        throw new Error("Prompt is required");
    }


    switch (provider) {

        case "openai":
            return await generateWithOpenAI(prompt);

        case "gemini":
            return await generateWithGemini(prompt);

        default:
            throw new Error(
                `Unsupported LLM provider: ${provider}`
            );
    }
};


export default generatePost;