import e from "express";
import {getAllMessagesWithConversationId, getAllMessagesWithUserId} from "../controllers/message.controller.js";

const router = e.Router();

router.get("/get-messages/:conversationId",getAllMessagesWithConversationId);
router.get("/get-messages-by-user/:userId",getAllMessagesWithUserId);
export default router;