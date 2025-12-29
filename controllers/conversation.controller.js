import CatchAsyncError from "../middleware/catchAsyncError";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import mongoose from "mongoose";
export const getConversationByUserId =CatchAsyncError( async (req, res) => {
    try {
        const { userId } = req.params;  
        const conversations = await Conversation.find({
  $or: [
    { request_user_id: new mongoose.Types.ObjectId(userId) },
    { response_user_id: new mongoose.Types.ObjectId(userId) }
  ]
}).sort({ createdAt: -1 });

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}
) 

export const deleteConversationById = CatchAsyncError(async (req, res) => {
  try {
    const { conversationId } = req.params;

    // 1️⃣ Delete all messages in this conversation
    await Message.deleteMany({
      conversation_id: conversationId,
    });

    // 2️⃣ Delete the conversation itself
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({
      success: true,
      message: "Conversation and related messages deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
})
