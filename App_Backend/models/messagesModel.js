import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User",
        required: true
    },
    text:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    }
)

const message = mongoose.model("Message", messageSchema)
export default message
