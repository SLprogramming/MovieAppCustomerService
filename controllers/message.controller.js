import CatchAsyncError from "../middleware/catchAsyncError.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";
export const getAllMessagesWithConversationId = CatchAsyncError(async (req, res) => {
    try {
        const { conversationId } = req.params;  
        const messages = await Message.find({ conversation_id: new mongoose.Types.ObjectId(conversationId) }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
})

export const getAllMessagesWithUserId = CatchAsyncError(async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({
            $or: [
                { request_user_id: new mongoose.Types.ObjectId(userId) },
                { response_user_id: new mongoose.Types.ObjectId(userId) },
            ],
        })
        const conversationIds = conversations.map(conv => conv._id);
        const messages = await Message.find({ conversation_id: { $in: conversationIds } }).sort({ createdAt: 1 }).populate({path:"sender_id", select:"name avatar role"});
        res.status(200).json({ success: true, messages });
       
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
})