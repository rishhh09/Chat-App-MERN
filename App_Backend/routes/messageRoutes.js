import express from 'express'
import {validateToken} from "../middleware/validateToken.js";
import { sendMessage, receiveMessage} from "../controllers/messageController.js";

const router = express.Router()

router.post('/', validateToken, sendMessage)
router.get('/:userId', validateToken, receiveMessage)

export default router