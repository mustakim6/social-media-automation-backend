import User from "../models/User.js"

const getProfile = async (req, res)=>{

try{
        const user = await User.findById(req.userId).select("-passwordHash")

    if(!user){
        return res.status(404).json({
            status:"ERR",
            message:"User not Found"
        })
    }

    res.status(200).json({
        status:"OK",
        message:"user found",
        user
    })
}catch(error){
    console.log(error)
    res.status(500).json({
        status:"ERR",
        message:"server error"
    })
}
}


export default getProfile;