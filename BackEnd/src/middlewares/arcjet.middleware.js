import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req,res,next) => {
    try {
       const decision = await aj.protect(req);

    //    if(decision.isDenied()){
    //     if(decision.reason.isRateLimit()){
    //         return res.status(429).json({message: "Rate limit exceeded. Please try again later."});
    //     // } else if(decision.reason.isBot()){
    //     //     return res.status(403).json({message: "Bot access denied."});
    //     }else{
    //         return res.status(403).json({message: "Access denied by Security Policy."})
    //     }
    //    }
       
       //check for SpoofedBot

       // Ensure results exists and use a proper predicate to avoid calling undefined
       if (Array.isArray(decision?.results) && decision.results.some((r) => isSpoofedBot(r))) {
            return res.status(403).json({error: "Spoofed Bot detected", message: "Malicious bot activity detected."})
       }

       next();
       
    } catch (error) {
       console.log("Arcjet Protection Error:",error);
       next(); 
    }
}