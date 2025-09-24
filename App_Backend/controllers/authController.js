import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        res.status(404)
        throw new Error("All fields are mandatory..")
    }

    const userAvailable = await User.findOne({ email })

    if (userAvailable) {
        res.status(400)
        throw new Error("User already exist")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    console.log(`user is created ${user}`)

    if (user) {
        res.status(200).json({ id: user._id, email: user.email })
    } else {
        res.status(400)
        throw new Error("user data is not valid..")
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error("All fields are mandatory..")
    }

    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        const payload = { user: { id: user._id.toString(), email: user.email } }
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' })

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        })

        return res.status(200).json({message: "Login Successfull",username: user.username })
    } else {
        res.status(401)
        throw new Error("Email and Password are not valid")
    }
}

export const logoutUser = async(req, res) => {
    try{
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        res.status(200).json({message: "User logout successfully..."})      
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

export const userInfo = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json("User is not Authorized")
        }

        const user = await User.findById(req.user.id).select('-password')

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        res.status(200).json({
            success: true,
            user: {
                username: user.username,
                id: user._id,
                email: user.email
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id username email"); 
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
