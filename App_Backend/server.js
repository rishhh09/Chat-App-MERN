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

// ✅ FIX CORS FOR COOKIES + RENDER
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

// ✅ SOCKET.IO WITH SAME CORS FIX
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  allowRequest: (req, callback) => {
    console.log("Socket.IO handshake origin:", req.headers.origin);
    callback(null, true); // allow all for now
  }
});

// SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`${socket.id} joined room ${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    data.sender = data.sender ?? socket.userId ?? socket.handshake?.auth?.userId ?? socket.id;

    if (typeof data.sender === 'object' && data.sender._id) {
      data.sender = data.sender._id;
    }

    console.log('📤 Message received on server:', data);

    try {
      const messageDoc = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
        createdAt: new Date()
      });
      await messageDoc.save();
    } catch (err) {
      console.error('Failed to save message', err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Port is listening on ${port}`);
});
