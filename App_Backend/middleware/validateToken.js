import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()

export const validateToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if(!token){
            return res.status(401).json({message: "Access Denied: No Token Provided"})
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "user is not Authorizedd" })
            }

            req.user = decoded.user
            next()
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error during authentication" });
    }
}
