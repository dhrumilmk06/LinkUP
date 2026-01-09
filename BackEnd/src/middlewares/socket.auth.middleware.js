import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../lib/env.js';

export const socketAuthMiddleware = async(socket,next) => {

    try {
        //extract token from http-only cookies
        
        const token = socket.handshake.headers.cookie
            ?.split('; ')
            ?.find((row) => row.startsWith('jwt='))
            ?.split('=') [1];
        

        if(!token){
            console.log("Socket Connection Rejected: No token provided");
            return next(new Error('Unauthorized: No token provided'));
        }

        //verify token 
        const decode = jwt.verify(token, ENV.JWT_SECRET);
        if(!decode) {
            console.log("Socket Connection Rejected: Invalid token");
            return next(new Error('Unauthorized: Invalid token'));
        }

        //find the user from db (extract userId from token payload)
        const userId = decode.userId || decode.user_id;
        if(!userId){
            console.log("Socket Connection Rejected: Invalid token payload (no user id)");
            return next(new Error("Unauthorized: Invalid token payload"));
        }
        const user = await User.findById(userId).select("-password");
        if(!user){
            console.log("Socket connection rejected: User not found");
            return next(new Error("User not found"));
        }


        //attach user info to socket
        socket.user = user;
        socket.userId = user._id.toString();

         console.log(`Socket authenticated for user: ${user.fullname} (${user._id})`);

        next();

    } catch (error) {
        console.log("Error in socket authentication:", error.message);
        next(new Error("Unauthorized - Authentication failed"));
    }

}
export default socketAuthMiddleware;