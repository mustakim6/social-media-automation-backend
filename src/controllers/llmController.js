import generatePost
    from "../services/llm/llmService.js";


const testLLM = async (req, res) => {
    try {

        const {
            prompt,
            llmProvider,
        } = req.body;


        if (!prompt || !llmProvider) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Prompt and llmProvider are required",
            });
        }


        const result = await generatePost({
            provider: llmProvider,
            prompt,
        });


        return res.status(200).json({
            status: "OK",
            message:
                "LLM response generated successfully",
            provider: llmProvider,
            result,
        });

    } catch (error) {

        console.error(
            "LLM test error:",
            error
        );


        return res.status(500).json({
            status: "ERR",
            message:
                error.message ||
                "LLM request failed",
        });
    }
};


export {
    testLLM,
};