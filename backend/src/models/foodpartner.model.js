const mongoose = require('mongoose');

const foodPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ContactName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String
    },
    profilePhotoFileId: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const FoodPartnerModel = mongoose.model('FoodPartner', foodPartnerSchema);

module.exports = FoodPartnerModel;