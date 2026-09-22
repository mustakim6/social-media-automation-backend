
const UserLogOut = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
    });

    return res.status(200).json({
        status: "OK",
        message: "logout successful",
    });
};

export default UserLogOut;