import CatchAsyncError from "../middleware/catchAsyncError.js";
import Message from "../models/message.model.js";
import UserModel from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { getIO } from "../utils/socket.js";
import ErrorHandler from "../utils/ErrorHandler.js";
// UserModel;
export const createMessage = CatchAsyncError(
  async ({ sender_id, message, file, conversation_id  }) => {
    const io = getIO();
    let conversation = null;

    // 1️⃣ Get conversation if provided
    if (conversation_id) {
      conversation = await Conversation.findById(conversation_id);
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

      io.to("admins").emit("conversation:new", conversation);
      // 🔔 notify admins about new conversation
      // emitToAdmins("new_conversation", conversation);
    }

    // 3️⃣ Save message
    const newMessage = await Message.create({
      sender_id,
      message,
      conversation_id: conversation._id,
      file:  null,
      status: "sent",
    });

    // 4️⃣ Socket logic
    if (conversation.response_user_id) {
      // normal chat (admin ↔ user)
      const receiverId =
        String(conversation.request_user_id) === String(sender_id)
          ? conversation.response_user_id
          : conversation.request_user_id;

      // emitToUser(receiverId, "new_message", newMessage);
      io.to(`user_${receiverId}`).emit("message:new", newMessage);
    } 

    console.log("Message created:", newMessage);

    return newMessage;
  }
);

export const takeConversation = CatchAsyncError(
  async ({ conversation_id, user_id }) => {
 const io = getIO();
    // 1️⃣ Find & take conversation atomically
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversation_id,
        status: "pending",              // only pending can be taken
        response_user_id: null,
      },
      {
        $set: {
          response_user_id: user_id,    // admin id
          status: "progress",
        },
      },
      {
        new: true,                      // return updated document
      }
    );

    // 2️⃣ If already taken
    if (!conversation) {
      throw new Error("Conversation already taken or not found");
    }

    
    // 🔔 socket emit (optional)
    // emitToUser(conversation.request_user_id, "conversation_taken", conversation);
    // emitToAdmins("conversation_removed_from_queue", conversation._id);
    io.to('admins').emit("newConversation:remove", conversation._id);

    return conversation;
  }
);


export const changeMessageStatus = CatchAsyncError(async (payload) => {
    console.log("Changing message status with payload:", payload);
});