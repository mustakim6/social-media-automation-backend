import createPostService from "../services/postService.js";

const createPost = async (req, res) => {
    try {
        const { facebookPageId, content } = req.body;

        if (!facebookPageId || !content) {
            return res.status(400).json({
                status: "ERR",
                message: "facebookPageId and content are required",
            });
        }

        const post = await createPostService({
            userId: req.userId,
            facebookPageId,
            content,
        });

        return res.status(201).json({
            status: "OK",
            message: "Post created successfully",
            post,
        });

    } catch (error) {
        console.error("Create post error:", error);

        return res.status(500).json({
            status: "ERR",
            message: error.message || "Failed to create post",
        });
    }
};

export {
    createPost,
};