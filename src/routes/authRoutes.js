import express from "express"
import { createUser } from "../controllers/authController.js"
import loginUser from "../controllers/loginController.js"
import authMiddleware from "../middlewares/authMiddleware.js"
import getProfile from "../controllers/getProfileController.js"
import UserLogOut from "../controllers/logOutController.js"


const router = express.Router()

router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/profile",authMiddleware, getProfile)
router.post("/logout", UserLogOut)

export default router;