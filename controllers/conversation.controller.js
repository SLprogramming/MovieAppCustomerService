import CatchAsyncError from "../middleware/catchAsyncError.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";
export const getConversationByUserId = CatchAsyncError(async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({
      $or: [
        { request_user_id: new mongoose.Types.ObjectId(userId) },
        { response_user_id: new mongoose.Types.ObjectId(userId) },
      ],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "request_user_id",
        select: "name avatar role",
      })
      .populate({ path: "response_user_id", select: "name avatar role" });
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        // Find the last message content for this conversation
        const lastMessage = await Message.findOne({
          conversation_id: conversation._id,
        })
          .sort({ createdAt: -1 })
          .select("message") // Only select the content field
          .lean();
        
        // Convert conversation to object and add lastMessage as string
        const conversationObj = conversation.toObject();
        conversationObj.lastMessage = lastMessage?.message || null;

        return conversationObj;
      }),
    );
    res
      .status(200)
      .json({ success: true, conversations: conversationsWithLastMessage });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});

export const getAllConversation = CatchAsyncError(async (req, res) => {
  try {
    let status = req.params.status || "pending";
    const conversations = await Conversation.find({ status })
      .sort({ createdAt: -1 })
      .populate({
        path: "request_user_id",
        select: "name avatar role",
      })
      .populate({
        path: "response_user_id",
        select: "name avatar role",
      });

    // Add only the last message text to each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        // Find the last message content for this conversation
        const lastMessage = await Message.findOne({
          conversation_id: conversation._id,
        })
          .sort({ createdAt: -1 })
          .select("message") // Only select the content field
          .lean();

        // Convert conversation to object and add lastMessage as string
       
        const conversationObj = conversation.toObject();
        conversationObj.lastMessage = lastMessage?.message || null;

        return conversationObj;
      }),
    );

    res.status(200).json({
      success: true,
      conversations: conversationsWithLastMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

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
});
