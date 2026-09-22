
const UserLogOut = async (req, res)=>{

    res.clearCookie("token", {
        httpOnly:true,
        secure:false,
        sameSite:"lax",
    })
    
    return res.status(200).json({
        status:"OK",
        message: "logout seccessful"
    })

}

export default UserLogOut;