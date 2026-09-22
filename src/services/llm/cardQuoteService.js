import generatePost from "./llmService.js";

const generateCardQuote = async ({
    provider,
    prompt,
}) => {
    if (!provider) {
        throw new Error(
            "LLM provider is required"
        );
    }

    if (
        !prompt ||
        typeof prompt !== "string" ||
        !prompt.trim()
    ) {
        throw new Error(
            "Prompt is required"
        );
    }

    const cardPrompt = `
You are creating text for a social media quote card.

User's topic:
${prompt.trim()}

Requirements:
- Create ONE short, meaningful quote.
- Prefer 2 or 3 lines.
- Maximum 4 lines.
- Maximum 18 words.
- Keep it suitable for a Facebook visual card.
- Make it natural and emotionally engaging.
- Do not write an essay.
- Do not explain anything.
- Do not add an introduction.
- Do not add hashtags.
- Do not add emojis.
- Return ONLY the quote.
- Preserve the language requested by the user.
- If the user's topic is in Bangla, write the quote in Bangla.
- If the user's topic is in English, write the quote in English.
`;

    const quote = await generatePost({
        provider,
        prompt: cardPrompt,
    });

    if (
        !quote ||
        typeof quote !== "string"
    ) {
        throw new Error(
            "LLM returned invalid card quote"
        );
    }

    return quote
        .trim()
        .replace(/^["']|["']$/g, "");
};

export default generateCardQuote;