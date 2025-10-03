import express from 'express'
const app = express()
import { connectDB } from './config/dbConnection.js'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import Message from './models/messagesModel.js'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
dotenv.config()

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

const port = process.env.PORT || 5000

connectDB()

app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/user', authRoutes)
app.use('/api/messages', messageRoutes)

const server = createServer(app)

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: true
    },
    
    allowRequest: (req, callback) => {
        console.log("Socket.IO handshake origin:", req.headers.origin);

        // Manually approving the request. 
        const isOriginAllowed = true; 
        callback(null, isOriginAllowed);
    }
});

io.on("connection", (socket) => {
    console.log("New user connected : ", socket.id)

    socket.on("join", (userId) => {
        socket.join(userId)
        console.log(`${socket.id} joined room ${userId}`)
    })

    socket.on('sendMessage', async (data) => {
        // fallback: if client omitted sender, try socket auth info
        data.sender = data.sender ?? socket.userId ?? socket.handshake?.auth?.userId ?? socket.id;

        // normalize sender to id string if object
        if (typeof data.sender === 'object' && data.sender._id) data.sender = data.sender._id;

        console.log('📤 Message received on server:', data);

        try {
            const messageDoc = new Message({
                sender: data.sender,
                receiver: data.receiver,
                text: data.text,
                createdAt: new Date()
            });
            await messageDoc.save();
            // emit saved message where needed...
        } catch (err) {
            console.error('Failed to save message', err);
        }
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id)
    })
})

server.listen(port, () => {
    console.log(`Port is listening on ${port}`)
})




