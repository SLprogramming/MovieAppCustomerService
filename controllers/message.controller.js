import CatchAsyncError from "../middleware/catchAsyncError";
import Message from "../models/message.model";
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