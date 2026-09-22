import generatePost from "./llmService.js";

const extractJson = (response) => {
    if (!response || typeof response !== "string") {
        throw new Error(
            "LLM returned invalid content"
        );
    }

    let cleanedResponse = response.trim();

    // Remove markdown code fences if Gemini adds them
    cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // Find the JSON object if there is extra text
    const firstBrace =
        cleanedResponse.indexOf("{");

    const lastBrace =
        cleanedResponse.lastIndexOf("}");

    if (
        firstBrace === -1 ||
        lastBrace === -1 ||
        lastBrace <= firstBrace
    ) {
        throw new Error(
            "LLM returned invalid JSON"
        );
    }

    cleanedResponse =
        cleanedResponse.slice(
            firstBrace,
            lastBrace + 1
        );

    try {
        return JSON.parse(
            cleanedResponse
        );
    } catch (error) {
        console.error(
            "Raw LLM response:",
            response
        );

        throw new Error(
            "LLM returned invalid JSON"
        );
    }
};

const generateContent = async ({
    provider,
    prompt,
    contentType = "text_only",
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

    let contentInstruction = "";

    if (contentType === "card") {
        contentInstruction = `
CONTENT REQUIREMENTS:
- Create ONE short, meaningful quote.
- Prefer 2 or 3 lines.
- Maximum 4 lines.
- Maximum 18 words.
- Make it suitable for a Facebook quote card.
- Do not write an essay.
`;
    } else {
        contentInstruction = `
CONTENT REQUIREMENTS:
- Create a meaningful Facebook post.
- Make it natural and engaging.
- Keep it focused on the user's topic.
- Do not add unnecessary explanations.
`;
    }

    const generationPrompt = `
You are a professional social media content writer.

USER TOPIC:
${prompt.trim()}

${contentInstruction}

CAPTION REQUIREMENTS:
- Create a separate Facebook caption related to the content.
- The caption should add context or encourage engagement.
- Keep it natural and concise.
- Do not repeat the content word-for-word.
- Do not use quotation marks.
- Do not add hashtags.
- Do not add emojis.

LANGUAGE:
- Follow the language requested by the user.
- If the user's topic is in Bengali, write both content and caption in natural Bengali.
- If the user's topic is in English, write both content and caption in English.

IMPORTANT:
- Return ONLY the JSON object.
- Do not use markdown.
- Do not wrap the JSON in code fences.
- Do not add any explanation before or after the JSON.
- Use exactly these two keys: content and caption.

{
    "content": "generated content here",
    "caption": "generated caption here"
}
`;

    const response = await generatePost({
        provider,
        prompt: generationPrompt,
    });

    const parsedResponse =
        extractJson(response);

    if (
        !parsedResponse.content ||
        typeof parsedResponse.content !== "string"
    ) {
        throw new Error(
            "LLM response is missing content"
        );
    }

    if (
        !parsedResponse.caption ||
        typeof parsedResponse.caption !== "string"
    ) {
        throw new Error(
            "LLM response is missing caption"
        );
    }

    return {
        content:
            parsedResponse.content.trim(),

        caption:
            parsedResponse.caption.trim(),
    };
};

export default generateContent;