import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("Attempting MongoDB connection...");

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error);

        throw error;
    }
};

export default connectDB;