const mongoose = require("mongoose")

const userModel = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,

    },
    image:{
        type:String
    },
    role: {
        type: String,
        enum: ["Admin", "Subadmin"],
        default: "Subadmin",
    },
    status: {
        type: String,
        enum: ["active", "deactive"],
        default: "active",
    },
})

module.exports = mongoose.model("user", userModel)