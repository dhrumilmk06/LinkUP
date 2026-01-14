import Message from '../models/Message.js'
import User from '../models/User.js'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getAllContacts = async (req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUser = await User.find({
        _id: { $ne: loggedInUserId },
        }).select("-password");

        res.status(200).json(filteredUser)
    } catch (error) {
        console.log("Error in getAllContacts: ", error);
        res.status(500).json({message :"server error"});
    }
}

export const getMessageByUserId = async (req,res) => {
    try {
       const myID = req.user._id;
       const { id: userToChatId } = req.params;

       const message = await Message.find({
        $or: [
            {senderId: myID, receiverId: userToChatId},
            {senderId: userToChatId, receiverId: myID},
        ]
       })
        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getMessages controller", error);
        res.status(500).json({error:"Internal server error "});
    }
}

export const sendMessage = async (req,res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

            if (!text && !image) {
                return res.status(400).json({ message: "Text or image is required." });
            }
            if (senderId.equals(receiverId)) {
                return res
                .status(400)
                .json({ message: "Cannot send messages to yourself." });
            }
            const receiverExists = await User.exists({ _id: receiverId });
            if (!receiverExists) {
                return res.status(404).json({ message: "Receiver not found." });
            }

        let imageUrl;
        if(image){
            const uploadResponse =await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message ({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save()

       const receiverSocketId = getReceiverSocketId(receiverId);
       if (receiverSocketId){
        io.to(receiverSocketId).emit("newMessage", newMessage)
       };

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in SendMessage controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getChatPartners =async (req,res) => {
    try {
        const loggedInUserId = req.user._id

        const message = await Message.find({
            $or: [{ senderId: loggedInUserId}, {receiverId: loggedInUserId}]
        });

        const chatPartnersIds = [ 
            ...new Set(
                message.map((msg) =>
                     msg.senderId.toString() === loggedInUserId.toString() 
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()))];

         const chatPartners = await User.find({
            _id: { $in: chatPartnersIds },
            }).select("-password");


        res.status(200).json(chatPartners);

    } catch (error) {
        console.error("Error in ChatParteners: ", error);
        res.status(500).json({error:"internal server error"});      
    }
}

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // find the message

    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });

    // check message ownership

    if (!message.senderId.equals(userId))
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });

    await Message.deleteOne({ _id: messageId });

    // real-time delete

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res
      .status(200)
      .json({ message: "Message deleted successfully: ", messageId });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update message controller

export const updateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // check the permission

    if (!message.senderId.equals(userId))
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });

    if((!text || text.trim() === '')) {
      return res.status(400).json({ message: 'Text is required' })
    }

    message.text = text;
    message.edited = true
    await message.save();

    // real-time update

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", message);
    }

    res.status(200).json(message);
}
    catch (error) {
        console.error("Error in updateMessage controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


