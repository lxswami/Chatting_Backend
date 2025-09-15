const mongoose = require("mongoose")

const recipeModel = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    image:{
        type:String,
    },
    description: {
        type: String,
        require: true
    },
    category:{
        type:String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",      //auth import user 
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },

})

module.exports = mongoose.model("recipe", recipeModel)