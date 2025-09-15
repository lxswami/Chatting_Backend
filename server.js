const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const dotenv = require('dotenv').config();
const http = require("http");
const { Server } = require("socket.io");
const messageModel = require("./modules/messageModel");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

// ✅ Correct mongoose connect
mongoose.connect(`${process.env.MONGO_URL}${process.env.DATABASE_NAME}`)
  .then(() => console.log(`✅ Your ${process.env.DATABASE_NAME} Database connected successfully`))
  .catch((error) => console.log("❌ DB connection error:", error));

// ✅ Your routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

const blogRoute = require("./routes/blogRoute");
app.use("/", blogRoute);

const dishRoute = require("./routes/dishRoute");
app.use("/", dishRoute);

const recipeRoute = require('./routes/recipeRoute');
app.use("/", recipeRoute);

const chatRoute = require("./routes/chatRoute")
app.use("/", chatRoute)

const notificationRoute = require("./routes/notificationRoute")
app.use("/", notificationRoute)

// ✅ Socket.io config
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const connectedUsers = {}; // userID : socketID map

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // 🔗 Register user
  socket.on("register", ({ userId }) => {
    connectedUsers[userId] = socket.id;
    console.log(`UserID: ${userId} mapped to ${socket.id}`);

    // Notify everyone except self
    socket.broadcast.emit("user-online", { userId });

    // ✅ Send full list of online users to this user
    socket.emit("online-users", Object.keys(connectedUsers));
  });

// ─── Private Message ───────────────────────────────
socket.on("myMessage", async ({ toUserId, fromUserId, message, roomId, tempId }) => {
  const newMessage = new messageModel({
    chatRoom: new mongoose.Types.ObjectId(roomId),
    sender: new mongoose.Types.ObjectId(fromUserId),
    message,
    status: "sent",
  });
  await newMessage.save();

  const receiverSocketId = connectedUsers[toUserId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", {
      fromUserId,
      message,
      roomId,
      messageId: newMessage._id,
    });

    await messageModel.findByIdAndUpdate(newMessage._id, { status: "delivered" });

    socket.emit("messageStatusUpdate", {
      tempId,
      messageId: newMessage._id,
      status: "delivered",
    });
  } else {
    socket.emit("messageStatusUpdate", {
      tempId,
      messageId: newMessage._id,
      status: "sent",
    });
  }
});

// ─── Group Message ───────────────────────────────
socket.on("groupMessage", async ({ roomId, fromUserId, message, tempId }) => {
  const newMessage = new messageModel({
    chatRoom: new mongoose.Types.ObjectId(roomId),
    sender: new mongoose.Types.ObjectId(fromUserId),
    message,
    status: "sent",
  });
  await newMessage.save();

  // Broadcast to all in room except sender
  io.to(roomId).emit("receiveMessage", {
    fromUserId,
    message,
    roomId,
    messageId: newMessage._id,
  });

  // Sender को भी तुरन्त confirm करना है
  socket.emit("messageStatusUpdate", {
    tempId,
    messageId: newMessage._id,
    status: "delivered",
  });
});

// ─── Seen update ───────────────────────────────
socket.on("message-seen", async ({ messageId, fromUserId }) => {
  await messageModel.findByIdAndUpdate(messageId, { status: "seen" });

  io.emit("messageStatusUpdate", {
    messageId,
    status: "seen",
  });
});


  // 📹 🔁 WebRTC: Handle joining a call room
  socket.on("join-video-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined-video", socket.id);
  });

  // 🎥 Send Offer
  socket.on("video-offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("receive-video-offer", { offer, senderId: socket.id });
  });

  // 📞 Send Answer
  socket.on("video-answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("receive-video-answer", { answer, senderId: socket.id });
  });

  // ❄️ ICE Candidates
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("receive-ice-candidate", { candidate, senderId: socket.id });
  });

  // 📞 Call cut / leave event
  socket.on("leave-video-call", ({ roomId }) => {
    console.log(`📴 User ${socket.id} left video room ${roomId}`);

    socket.to(roomId).emit("user-left-video", { leaverId: socket.id });

    socket.leave(roomId);
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`🔴 User ${userId} is offline`);
        socket.broadcast.emit("user-offline", { userId });
        break;
      }
    }
  });
});

// ✅ Correct server start
const startServer = () => {
  server.listen(process.env.SERVER_PORT, () => {
    console.log('✅ Your project running on port ' + process.env.SERVER_PORT);
    console.log(`🌐 Your server ready: ${process.env.SERVER_LOCALHOST}:${process.env.SERVER_PORT}`);
  });
};

startServer();

















// const express = require("express");
// const mongoose = require('mongoose');
// const cors = require("cors");
// const dotenv = require('dotenv').config();
// const http = require("http");
// const { Server } = require("socket.io");
// const messageModel = require("./modules/messageModel");


// const app = express();
// const server = http.createServer(app);

// app.use(express.json());
// app.use(cors());

// // ✅ Correct mongoose connect
// mongoose.connect(`${process.env.MONGO_URL}${process.env.DATABASE_NAME}`)
//   .then(() => console.log(`✅ Your ${process.env.DATABASE_NAME} Database connected successfully`))
//   .catch((error) => console.log("❌ DB connection error:", error));

// // ✅ Your routes
// const userRoute = require("./routes/userRoute");
// app.use("/", userRoute);

// const blogRoute = require("./routes/blogRoute");
// app.use("/", blogRoute);

// const dishRoute = require("./routes/dishRoute");
// app.use("/", dishRoute);

// const recipeRoute = require('./routes/recipeRoute');
// app.use("/", recipeRoute);

// const chatRoute = require("./routes/chatRoute")
// app.use("/", chatRoute)

// const notificationRoute = require("./routes/notificationRoute")
// app.use("/", notificationRoute)





// // ✅ Socket.io config
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// const connectedUsers = {}; // userID : socketID map

// io.on("connection", (socket) => {
//   console.log("✅ New client connected:", socket.id);

//   socket.on("register", ({ userId }) => {
//     connectedUsers[userId] = socket.id;
//     console.log(`UserID: ${userId} mapped to ${socket.id}`);

//     // Notify everyone except self
//     socket.broadcast.emit("user-online", { userId });

//     // ✅ Send full list of online users to this user
//     socket.emit("online-users", Object.keys(connectedUsers));

//   });



//   socket.on("myMessage", async ({ toUserId, fromUserId, message, roomId }) => {
//     console.log(`📨 ${fromUserId} says to ${toUserId}: ${message} in Room ${roomId}`);


//     // 1️⃣ DB mein bhi save karo:
//     const newMessage = new messageModel({
//       chatRoom: new mongoose.Types.ObjectId(roomId),
//       sender: new mongoose.Types.ObjectId(fromUserId),
//       message: message,
//       status: "sent",
//       createdAt: new Date()
//     });
//     newMessage.save();



//     const receiverSocketId = connectedUsers[toUserId];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("receiveMessage", {
//         fromUserId,
//         message,
//         roomId,
//         messageId: newMessage._id,
//       });

//       await messageModel.findByIdAndUpdate(newMessage._id, { status: "delivered" });

//       socket.emit("messageStatusUpdate", {
//         messageId: newMessage._id,
//         status: "delivered"
//       });

//     } else {
//       // Receiver offline => just ✔
//       socket.emit("messageStatusUpdate", {
//         messageId: newMessage._id,
//         status: "sent"
//       });
//     }



  


//     // ✅ Server confirms to sender too
//     socket.emit("messageDelivered", {
//       status: `✅ Message delivered to ${toUserId || 'nobody (not connected)'}`,
//       message: message
//     });
//   });


//     // ✅ Handle Seen Status (✔✔🔵)
//     socket.on("message-seen", async ({ messageId, fromUserId }) => {
//       await messageModel.findByIdAndUpdate(messageId, { status: "seen" });

//       const senderSocketId = connectedUsers[fromUserId];
//       if (senderSocketId) {
//         io.to(senderSocketId).emit("messageStatusUpdate", {
//           messageId,
//           status: "seen"
//         });
//       }
//     });



//   // 📹 🔁 WebRTC: Handle joining a call room
//   socket.on("join-video-room", (roomId) => {
//     socket.join(roomId);
//     socket.to(roomId).emit("user-joined-video", socket.id);
//   });

//   // 🎥 Send Offer
//   socket.on("video-offer", ({ roomId, offer }) => {
//     socket.to(roomId).emit("receive-video-offer", { offer, senderId: socket.id, });
//   });

//   // 📞 Send Answer
//   socket.on("video-answer", ({ roomId, answer }) => {
//     socket.to(roomId).emit("receive-video-answer", { answer, senderId: socket.id });
//   });

//   // ❄️ ICE Candidates
//   socket.on("ice-candidate", ({ roomId, candidate }) => {
//     socket.to(roomId).emit("receive-ice-candidate", { candidate, senderId: socket.id });
//   });


//   // 📞 Call cut / leave event
//   socket.on("leave-video-call", ({ roomId }) => {
//     console.log(`📴 User ${socket.id} left video room ${roomId}`);

//     // Notify other users in the room
//     socket.to(roomId).emit("user-left-video", { leaverId: socket.id });

//     // Leave the room
//     socket.leave(roomId);
//   });





//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//     for (const userId in connectedUsers) {
//       if (connectedUsers[userId] === socket.id) {
//         delete connectedUsers[userId];
//         console.log(`🔴 User ${userId} is offline`);
//         socket.broadcast.emit("user-offline", { userId });
//         break;
//       }
//     }
//   });
// });

// // ✅ Correct server start
// const startServer = () => {
//   server.listen(process.env.SERVER_PORT, () => {
//     console.log('✅ Your project running on port ' + process.env.SERVER_PORT);
//     console.log(`🌐 Your server ready: ${process.env.SERVER_LOCALHOST}:${process.env.SERVER_PORT}`);
//   });
// };

// startServer();
