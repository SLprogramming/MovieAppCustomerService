import e from "express";
import {getAllMessagesWithConversationId} from "../controllers/message.controller.js";

const router = e.Router();

router.get("/get-messages/:conversationId",getAllMessagesWithConversationId);

export default router;