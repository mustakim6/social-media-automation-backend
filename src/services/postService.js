import Post from "../models/Post.js";
import FacebookPage from "../models/FacebookPage.js";

const createPost = async ({
    userId,
    facebookPageId,
    content,
}) => {
    const page = await FacebookPage.findOne({
        _id: facebookPageId,
        userId,
        isActive: true,
    });

    if (!page) {
        throw new Error("Facebook Page not found");
    }

    const post = await Post.create({
        userId,
        facebookPageId,
        content,
        status: "draft",
    });

    return post;
};

export default createPost;