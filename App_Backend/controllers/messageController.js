import Message from "../models/messagesModel.js";

export const sendMessage = async(req, res) => {
    try{
        const {text, receiver} = req.body

        if(!text || !receiver){
            return res.status(404).json({message: "Either 'text' or 'receiver' is missing"})
        }

        const newMessage = new Message({
            sender: req.user.id,
            receiver, 
            text
        })

        console.log("req.user 👉", req.user);
        const savedMessage = await newMessage.save()
        res.status(201).json(savedMessage)

    }catch(err){
        console.error("Error saving message:", err);
        return res.status(500).json({ error: err.message });
    }
}

export const receiveMessage = async(req, res) => {
    try{
        const otherUserID = req.params.userId

        if(!otherUserID){
            return res.status(404).json({message:"missing otherUserID in receiveMessage "})
        }

        const messages = await Message.find({
            $or:[
                {sender: otherUserID , receiver: req.user.id},
                {sender: req.user.id, receiver: otherUserID}
            ]
        }).populate("sender", "username, email")
          .populate("receiver", "username, email")
          .sort({createdAt: 1})

        res.status(201).json(messages)

    }catch(err){
        console.error("Error getting message:", err);
        return res.status(500).json({ error: err.message });
    }
}




