import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Enter the username"]
    },

    email: {
        type: String,
        required: [true, "Enter the email address"],
        unique: [true, "Entered email is already in use"]
    },

    password: {
        type: String,
        required: [true, "Enter the password"]
    },

    profilePhoto: {
        type: String, 
        default: ""
    },
},
    {
        timestamps: true
    }
)

export default mongoose.model("User", userSchema)