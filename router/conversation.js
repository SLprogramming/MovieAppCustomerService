import e from "express";
import {deleteConversationById, getAllConversation,getConversationByUserId} from "../controllers/conversation.controller.js";
const router = e.Router();

router.get("/get-all",getAllConversation);
router.get("/get/:id",getConversationByUserId)
router.delete("/delete-conversation/:conversationId",deleteConversationById)

export default router;