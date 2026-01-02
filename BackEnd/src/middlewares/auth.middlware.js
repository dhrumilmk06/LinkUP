import jwt from "jsonwebtoken";
import User from "../models/User.js"
import {ENV} from "../lib/env.js"

export const protectRoute = async (req,res,next) => {

    try {
        const token = req.cookies?.jwt;
        if(!token) return res.status(401).json({message: "Unauthorized - No token provided"})

        const decode = jwt.verify(token, ENV.JWT_SECRET);
        if(!decode) return res.status(401).json({message: "Unauthorized - Invalid token"})

        // Support both `userId` (current token) and `user_id` (older tokens / variants)
        const userId = decode.userId || decode.user_id;
        const user = await User.findById(userId).select("-password");
        if(!user) return res.status(404).json({message: "User not found"});

        req.user = user;
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        res.status(500).json({message: "Internal Server Error"})
    }
};