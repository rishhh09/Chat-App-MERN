import mongoose, { connect } from "mongoose";
import dotenv from "dotenv"
dotenv.config()

export const connectDB = async() => {
    try{
         console.log("Connecting to the database...")
        const connect = await mongoose.connect(process.env.CONNECTION_URI)
        console.log("Database connected successfully:", 
                connect.connection.host,
                connect.connection.name
        )
    }catch(err){
        console.log("Error connecting database : ", err.message)
        process.exit(1)
    }
}