const mongoose = require("mongoose")

const chatModel = new mongoose.Schema({

    name: {
        type: String,
        // required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        // required: true
    },
    title: {
        type: String,
        // required: true, // optional hai, agar chaho to hata sakte ho
    },
    type: {
        type: String,
        enum: ["group", "private"],
        // required: true,
    },
    image: {
        type: String
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    pendingUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],

    rejectedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    status: {
        type: String,
        enum: ["active", "pending", "rejected"],
        default: "pending"
    },


})


module.exports = mongoose.model('chat', chatModel)