import e from "express";
import {deleteConversationById, getAllConversation,getConversationByUserId} from "../controllers/conversation.controller.js";
const router = e.Router();

router.get("/get-all",getAllConversation);
router.get("/get-by-user/:userId",getConversationByUserId)
router.delete("/delete-conversation/:conversationId",deleteConversationById)

export default router;