import jwt from "jsonwebtoken";


const authMiddleware = async (req, res, next)=>{

    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            status: "ERR",
            message:"authentication required"
        })
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = decoded.userId

        next()

    }catch(error){
        return res.status(401).json({
            status:"ERR",
            message:"Invalid or expired token."
        })
    }

}

export default authMiddleware;