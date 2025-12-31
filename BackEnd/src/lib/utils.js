import jwt from "jsonwebtoken"


export const generateToken = (userId,res) => {
    const { JWT_SECRET } = ENV;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

   const token =  jwt.sign({userId}, process.env.JWT_SECRET,{
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