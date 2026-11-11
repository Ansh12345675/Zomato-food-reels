const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    video: {
        type: String,
        required: true
    },
    videoFileId: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodPartner",
        required: true
    },
    likeCount: {
        type: Number,
        default: 0
    }

})

const foodModel = mongoose.model("Food", foodSchema);

module.exports = foodModel;