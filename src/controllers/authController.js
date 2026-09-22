import bcrypt from "bcrypt"
import User from "../models/User.js";

const createUser = async (req, res)=>{
    const {name, email, password} = req.body;

    try{

        if(!name || !email || !password){
       return res.status(400).json({
            status:"ERR",
            message:"Name, email and password required!"
        })
        
    }

    const existingUser = await User.findOne({email})

    if(existingUser){
       return res.status(409).json({
            status:"ERR",
            message:"Email already exist!"
        })
        
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
        name, email, passwordHash
    })
    

    return res.status(201).json({
        status:"OK",
        message:"User Registered Successfully!",
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }

    })

    }catch(error){
       console.log(error)
        return res.status(500).json({
            status:"Err",
            message:"server error"
        })
    }

    
}

export {createUser}