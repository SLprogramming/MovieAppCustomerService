// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // receiver_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    client_id:{
      type: String,
      required: true,
    },
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "seen"," failed"],
      default: "sending",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    file: {
      publicID: { type: String, default: null },
      url: { type: String, default: null },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
