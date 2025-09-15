const mongoose = require("mongoose");

const dishModel = mongoose.Schema({
    title: {
        type: String,

    },
    rating: {
        type: String,

    },
    price: {
        type: String,

    },
    description: {
        type: String,

    },
})


module.exports =mongoose.model("dish",dishModel)