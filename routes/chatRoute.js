const express= require("express")
const chatRoute = express()
const auth = require("../middlware/auth")
const upload = require("../config/multer")

const chatControllerFile = require("../controller/chatController")

chatRoute.use(express.json());

chatRoute.post("/create/chat",auth,chatControllerFile.creatChat)

chatRoute.post("/accept/reject/chat",chatControllerFile.acceptChat)

chatRoute.post("/chatroomlist",auth,chatControllerFile.getAllChatRoom)

chatRoute.post("/send/message",auth,upload.single("image"),chatControllerFile.sendMessage)


chatRoute.post("/chat/history",chatControllerFile.getChatHistory)




module.exports = chatRoute