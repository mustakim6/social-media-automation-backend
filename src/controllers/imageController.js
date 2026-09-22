import generateImage from "../services/image/imageGenerationService.js";


const generateImageController = async (req, res) => {
    try {
        const {
            provider,
            prompt,
        } = req.body;


        if (!provider) {
            return res.status(400).json({
                status: "ERR",
                message: "Image provider is required",
            });
        }


        if (
            !prompt ||
            typeof prompt !== "string" ||
            !prompt.trim()
        ) {
            return res.status(400).json({
                status: "ERR",
                message: "Image prompt is required",
            });
        }


        const image = await generateImage({
            provider,
            prompt,
        });


        return res.status(200).json({
            status: "OK",
            message:
                "Image generated successfully",

            provider,

            image: {
                mimeType: image.mimeType,
                data: image.data,
            },
        });

    } catch (error) {

        console.error(
            "Image generation error:",
            error
        );


        return res.status(500).json({
            status: "ERR",
            message:
                error.message ||
                "Failed to generate image",
        });
    }
};


export {
    generateImageController,
};