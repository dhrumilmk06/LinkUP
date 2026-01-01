import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, //For security prevent XSS attack
        sameSite: "strict"//also for security  for CSRF attack
    });

    return token;
}

export default generateToken;