// models/conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "progress", "finish"],
      default: "pending",
      required: true,
    },
    request_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    response_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
