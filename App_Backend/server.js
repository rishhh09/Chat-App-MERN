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

// SUPPORT MULTIPLE ORIGINS
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [
  "http://localhost:5173"
];

const port = process.env.PORT || 5000

connectDB()

// CORS FIX FOR COOKIES + SOCKET.IO
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())
app.use(cookieParser())

// ROUTES
app.use('/api/user', authRoutes)
app.use('/api/messages', messageRoutes)

const server = createServer(app)

// SOCKET.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  allowRequest: (req, callback) => {
    console.log("Socket.IO handshake origin:", req.headers.origin);
    callback(null, true);
  }
});

//SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);


  // 1️ USER JOINS → mark undelivered messages as delivered
  socket.on("join", async (userId) => {
    socket.join(userId);
    socket.userId = userId;

    console.log(`${socket.id} joined room ${userId}`);

    // Mark all messages delivered when receiver comes online
    await Message.updateMany(
      { receiver: userId, delivered: false },
      { $set: { delivered: true } }
    );

    // Notify sender(s)
    io.emit("messagesDelivered", { deliveredTo: userId });
  });

  // 2️ SEND MESSAGE
  socket.on('sendMessage', async (data) => {
    data.sender = data.sender ?? socket.userId ?? socket.handshake?.auth?.userId;

    if (typeof data.sender === 'object' && data.sender._id) {
      data.sender = data.sender._id;
    }

    console.log('📤 Message received on server:', data);

    try {
      // Save message
      const messageDoc = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
        delivered: false,
        seen: false,
        createdAt: new Date()
      });

      // Immediately emit message to receiver room
      io.to(data.receiver).emit("receiveMessage", messageDoc);

    } catch (err) {
      console.error('Failed to save message', err);
    }
  });

  // 3️ MARK AS SEEN (when chat is opened)
  socket.on("markAsSeen", async ({ senderId, receiverId }) => {

    // Update DB
    await Message.updateMany(
      { sender: senderId, receiver: receiverId, seen: false },
      { $set: { seen: true, delivered: true } } // seen implies delivered
    );

    // Notify the sender their messages were seen
    io.to(senderId).emit("messagesSeen", { by: receiverId });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Port is listening on ${port}`);
});
