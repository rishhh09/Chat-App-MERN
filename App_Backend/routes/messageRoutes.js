import express from 'express'
import { validateToken } from "../middleware/validateToken.js";
import { sendMessage, receiveMessage } from "../controllers/messageController.js";
import Message from "../models/messagesModel.js";

const router = express.Router();

// SEND MESSAGE
router.post('/', validateToken, sendMessage);

// GET UNSEEN MESSAGE COUNTS
router.get('/unseen/:receiverId', validateToken, async (req, res) => {
  try {
    const receiverId = req.params.receiverId;

    const result = await Message.aggregate([
      {
        $match: {
          receiver: receiverId,
          seen: false
        }
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);

    const unseen = {};
    result.forEach(r => {
      unseen[r._id] = r.count;
    });

    res.json({ unseen });

  } catch (error) {
    console.error("Error fetching unseen messages:", error);
    res.status(500).json({ message: "Failed to fetch unseen messages" });
  }
});

// GET CHAT MESSAGES
router.get('/:userId', validateToken, receiveMessage);

export default router;
