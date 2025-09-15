const mongoose = require("mongoose")

const notificationModel = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("notification",notificationModel)