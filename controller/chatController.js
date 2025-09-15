const express = require("express")
// const chatModelFile = require("../modules/chatModel")
const chatModel = require("../modules/chatModel")
const mongoose = require("mongoose");
const messageModel = require("../modules/messageModel")
const cloudinary = require("../config/cloudinary")
const fs = require("fs");


// one to one chat

// module.exports.creatChat = async (req, res) => {

//     try {

//         const { name, createdBy, inviteUser } = req.body
//         console.log(">>>>", req.body);

//         // if (!name || !createdBy) {
//         //     res.json({
//         //         status: 400,
//         //         success: false,
//         //         message: "name and created required"
//         //     })
//         // }

//         const exist = await chatModel.findOne({ name });
//         if (exist) {
//             return res.status(400).json({ success: false, message: "Chat Room already exists" });
//         }


//         const room = new chatModel({
//             name,
//             createdBy,
//             users: [createdBy],
//             pendingUsers: inviteUser || [],
//             status: "pending"
//         })

//         await room.save();
//         res.json({
//             status: 200,
//             success: true,
//             message: "created room",
//             data: room
//         })


//     } catch (error) {
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message
//         })
//     }


// }




module.exports.creatChat = async (req, res) => {
  try {
    const { name, createdBy, inviteUser, type } = req.body;

    // ✅ Normalize inviteUser to array
    const inviteUsersArray = Array.isArray(inviteUser)
      ? inviteUser
      : inviteUser
      ? [inviteUser]
      : [];

    let users = [createdBy];
    let pendingUsers = [];
    let status = "pending";

    // ✅ Private Chat Condition First
    if (type === "private") {
      if (inviteUsersArray.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Private chat must have one invited user",
        });
      }

      // ✅ Check if a private chat already exists between the same two users
      const existingPrivateChat = await chatModel.findOne({
        type: "private",
        $or: [
          { users: { $all: [createdBy, inviteUsersArray[0]] } },
          { pendingUsers: { $all: [createdBy, inviteUsersArray[0]] } },
        ],
      });

      if (existingPrivateChat) {
        return res.status(400).json({
          success: false,
          message: "Private chat already exists between these users",
        });
      }

      users = [createdBy];
      pendingUsers = [inviteUsersArray[0]];
      status = "pending";             
    }

    // ✅ Group Chat
    else if (type === "group") {
      users = [createdBy];
      pendingUsers = inviteUsersArray;
      status = pendingUsers.length === 0 ? "active" : "pending";
    }

    // ❌ Invalid type
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid chat type (should be 'private' or 'group')",
      });
    }

    // ✅ Optional: Room name check only for group (not private)
    const existingRoom = await chatModel.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Chat Room with this name already exists",
      });
    }

    const room = new chatModel({
      name,
      createdBy,
      type,
      users,
      pendingUsers,
      status,
    });

    await room.save();

    res.status(200).json({
      success: true,
      message: "Chat room created successfully",
      data: room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






module.exports.acceptChat = async (req, res) => {

  try {

    const { roomId, userId, action } = req.body

    const room = await chatModel.findById(roomId);
    if (!room) {
      res.json({
        status: 400,
        success: false,
        message: "Room not found"
      })
    }

    // Check if user was invited
    if (!room.pendingUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: "User not in pending list" });
    }

    // Remove from pendingUsers
    room.pendingUsers = room.pendingUsers.filter(u => u.toString() !== userId);

    if (action === "accept") {
      room.users.push(userId);
    } else if (action === "reject") {
      room.rejectedUsers.push(userId);
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    // Update status
    if (room.users.length > 1) {              // 1 se jyada honge tab active hoga
      room.status = "active";
    } else if (room.pendingUsers.length > 0) {
      room.status = "pending";
    } else {
      room.status = "rejected";
    }

    await room.save();

    res.status(200).json({ success: true, room });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: error.message });
  }
}





module.exports.getAllChatRoom = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ JWT se user ID

    console.log("Logged in User ID:", userId);

    const { status } = req.body; // ✅ Get status from query ?status=active

    const filter = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { users: new mongoose.Types.ObjectId(userId) },
        { pendingUsers: new mongoose.Types.ObjectId(userId) },
      ],
    };

    // ✅ If status is passed, add to filter
    if (status && ["active", "pending", "rejected"].includes(status)) {
      filter.status = status;
    }

    const chat = await chatModel.find(filter).sort({ createdAt: -1 });

    // Add user-specific status
    const chatWithUserStatus = chat.map(room => {
      let userStatus = "none";
      if (room.users.map(u => u.toString()).includes(userId)) {
        userStatus = "active";
      } else if (room.pendingUsers.map(u => u.toString()).includes(userId)) {
        userStatus = "pending";
      } else if (room.rejectedUsers && room.rejectedUsers.map(u => u.toString()).includes(userId)) {
        userStatus = "rejected";
      }
      return {
        ...room.toObject(),
        userStatus
      };
    });

    res.json({
      status: 200,
      success: true,
      message: "Filtered chat rooms fetched successfully",
      total: chat.length,
      data: chatWithUserStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      success: false,
      message: error.message,
    });
  }
};





module.exports.sendMessage = async (req, res) => {
  try {
    const { roomId, message } = req.body;
    const senderId = req.user.id;

    let imageUrl = null;

    // ✅ If file exists, upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "chat_image",
      });

      imageUrl = result.secure_url;
      //   console.log(">>>>",imageUrl);


      // ✅ Remove local temp file
      fs.unlinkSync(req.file.path);
    }

    const newMessage = new messageModel({
      chatRoom: new mongoose.Types.ObjectId(roomId),
      sender: new mongoose.Types.ObjectId(senderId),
      message: message,
      image: imageUrl,
      createdAt: new Date(),
    });

    await newMessage.save();




    res.status(200).json({
      success: true,
      message: "Message sent",
      data: newMessage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



module.exports.getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.body;
    console.log(">>>>>>>>>.", req.body);


    if (!roomId) {
      return res.status(400).json({ success: false, message: "chatRoomId is required" });
    }

    const messages = await messageModel.find({ chatRoom: roomId })


      .populate("sender", "name email") // agar aapko sender info chahiye
      .sort({ createdAt: 1 }); // old to new
    console.log(">>>", messages);


    res.status(200).json({
      success: true,
      message: "Chat history fetched",
      total: messages.length,
      data: messages
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};








