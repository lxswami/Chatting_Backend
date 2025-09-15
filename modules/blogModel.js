const mongoose = require("mongoose")

const blogModel = mongoose.Schema({
    title: {
        type: String,
        require: true
    },

    content: {
        type: String,
        require: true
    },
    slug: { type: String, required: true, unique: true },

    image:{
        type:String
    },
    description: { type: String },
})

module.exports = mongoose.model("blog",blogModel)