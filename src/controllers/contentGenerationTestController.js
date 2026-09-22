import generateContent from "../services/llm/contentGenerationService.js";

const testContentGeneration = async (req, res) => {
    try {
        const {
            provider,
            prompt,
            contentType = "text_only",
        } = req.body;

        if (!provider) {
            return res.status(400).json({
                status: "ERR",
                message: "provider is required",
            });
        }

        if (!prompt) {
            return res.status(400).json({
                status: "ERR",
                message: "prompt is required",
            });
        }

        const result = await generateContent({
            provider,
            prompt,
            contentType,
        });

        return res.status(200).json({
            status: "OK",
            message:
                "Content and caption generated successfully",
            provider,
            contentType,
            result,
        });
    } catch (error) {
        console.error(
            "Content generation test error:",
            error
        );

        return res.status(500).json({
            status: "ERR",
            message:
                error.message ||
                "Failed to generate content",
        });
    }
};

export default testContentGeneration;