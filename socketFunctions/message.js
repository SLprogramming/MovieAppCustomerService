import CatchAsyncError from "../middleware/catchAsyncError.js";
import Message from "../models/message.model.js";
import UserModel from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { getIO } from "../utils/socket.js";
import ErrorHandler from "../utils/ErrorHandler.js";
// UserModel;
export const createMessage = CatchAsyncError(
  async ({ sender_id, message, file, conversation_id, client_id }) => {
    const io = getIO();
    let conversation = null;

    // 1️⃣ Get conversation if provided
    if (conversation_id) {
      conversation = await Conversation.findById(conversation_id).populate({
        path: "request_user_id",
        select: "name avatar role",
      });
    }

    // 2️⃣ Create conversation if not exists (first message)
    if (!conversation) {
      conversation = await Conversation.create({
        request_user_id: sender_id,
        response_user_id: null,
        status: "pending",
      });
      conversation = await conversation.populate({
        path: "request_user_id",
        select: "name avatar role",
      });

      // 🔔 notify admins about new conversation
      // emitToAdmins("new_conversation", conversation);
     

    const conversationObj = conversation.toObject();
    conversationObj.lastMessage = message

    io.to("admins").emit("pendingConversation:new", conversationObj);
    io.to(`user_${sender_id}`).emit("conversation:new", conversationObj);
    }

    // 3️⃣ Save message
    let newMessage = await Message.create({
      client_id,
      sender_id,
      message,
      conversation_id: conversation._id,
      file: null,
      status: "sent",
    });
    newMessage = await newMessage.populate({
      path: "sender_id",
      select: "name avatar role",
    });

  
    io.to(`user_${sender_id}`).emit("message:saved", newMessage);
    
    // 4️⃣ Socket logic
    if (conversation.response_user_id) {
      // normal chat (admin ↔ user)
      const receiverId =
        String(conversation.request_user_id?._id) === String(sender_id)
          ? conversation.response_user_id
          : conversation.request_user_id?._id;

      // emitToUser(receiverId, "new_message", newMessage);
      console.log(receiverId)
      io.to(`user_${receiverId}`).emit("message:new", newMessage);
    }else{
      io.to('admins').emit("message:new",newMessage)
    }

    // console.log("Message created:", newMessage);

    return newMessage;
  },
);

export const takeConversation = CatchAsyncError(
  async ({ conversation_id, user_id }) => {
    const io = getIO();
    // 1️⃣ Find & take conversation atomically
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversation_id,
        status: "pending", // only pending can be taken
        response_user_id: null,
      },
      {
        $set: {
          response_user_id: user_id, // admin id
          status: "progress",
        },
      },
      {
        new: true, // return updated document
      },
    ).populate({
        path: "request_user_id",
        select: "name avatar role",
      });

    // 2️⃣ If already taken
    if (!conversation) {
      return;
    }

    // 🔔 socket emit (optional)
    // emitToUser(conversation.request_user_id, "conversation_taken", conversation);
    // emitToAdmins("conversation_removed_from_queue", conversation._id);
    const lastMessage = await Message.findOne({
      conversation_id: conversation._id,
    })
      .sort({ createdAt: -1 })
      .select("message") // Only select the content field
      .lean();
    const conversationObj = conversation.toObject();
    conversationObj.lastMessage = lastMessage?.message || null;
    io.to("admins").emit("newConversation:remove", conversation._id);
    io.to(`user_${user_id}`).emit("conversation:new", conversationObj);

    return conversation;
  },
);

export const changeMessageStatus = CatchAsyncError(async (payload) => {
  console.log("Changing message status with payload:", payload);
});
