import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateWithOpenAI = async (prompt) => {
    const response = await openai.responses.create({
        model: "gpt-5",
        input: prompt,
    });

    return response.output_text;
};

export default generateWithOpenAI;