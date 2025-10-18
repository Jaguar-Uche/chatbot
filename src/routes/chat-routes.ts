import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import { deleteChats, generateChatCompletion, sendChats } from "../controllers/chat-controllers.js";

//chatRoutes is a protected api so only the verified and authenticated users can access it 
const chatRoutes = Router();

chatRoutes.post("/new",validate(chatCompletionValidator), verifyToken, generateChatCompletion)

chatRoutes.get("/all-chats",verifyToken, sendChats);

chatRoutes.delete("/delete", verifyToken, deleteChats);

export default chatRoutes;