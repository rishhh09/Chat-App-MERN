import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

// CHECK IF IN PRODUCTION (Render)
const isProd = process.env.NODE_ENV === "production";

// COOKIE SETTINGS
const cookieOptions = {
    httpOnly: true,
    secure: isProd,            // 🔥 cookie only over HTTPS in production
    sameSite: isProd ? "none" : "lax", // 🔥 REQUIRED for Render cross-domain cookies
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are mandatory." });
    }

    const userAvailable = await User.findOne({ email });

    if (userAvailable) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    if (user) {
        return res.status(200).json({ id: user._id, email: user.email });
    } else {
        return res.status(400).json({ message: "User data is not valid" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are mandatory." });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {

        const payload = { user: { id: user._id.toString(), email: user.email } };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' });

        // 🔥 FIXED COOKIE for Render
        res.cookie("jwt", token, cookieOptions);

        return res.status(200).json({
            message: "Login Successful",
            username: user.username,
            userId: user._id
        });
    } else {
        return res.status(401).json({ message: "Invalid email or password" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        // 🔥 must clear cookie with same options
        res.cookie("jwt", "", {
            ...cookieOptions,
            expires: new Date(0)
        });

        return res.status(200).json({ message: "User logged out successfully." });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const userInfo = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User is not Authorized" });
        }

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            user: {
                username: user.username,
                id: user._id,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "_id username email");
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch users" });
    }
};
