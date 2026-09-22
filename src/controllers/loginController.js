import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const findUser = await User.findOne({ email });

        if (!findUser) {
            return res.status(401).json({
                status: "authentication failure",
                message: "Invalid email or password",
            });
        }

        const passCheck = await bcrypt.compare(
            password,
            findUser.passwordHash
        );

        if (!passCheck) {
            return res.status(401).json({
                status: "authentication failure.",
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { userId: findUser._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            status: "OK",
            message: "LogIn successfull.",
            user: {
                userId: findUser._id,
                name: findUser.name,
                email: findUser.email,
            },
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: "ERR",
            message: "server error, login failed!",
        });
    }
};

export default loginUser;