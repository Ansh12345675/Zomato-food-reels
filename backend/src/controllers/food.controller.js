const foodmodel = require('../models/food model');
const storageservice = require('../services/storage.service');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const saveModel = require('../models/save.models');

async function createFood(req, res) {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();

    if (!name || !description || !req.file) {
        return res.status(400).json({
            message: 'Video title, description, and a video file are required.'
        });
    }

    try {
        const fileUploadResult = await storageservice.uploadFile(req.file.buffer, uuidv4());
        const foodItem = await foodmodel.create({
            name,
            description,
            video: fileUploadResult.url,
            videoFileId: fileUploadResult.fileId,
            foodPartner: req.foodPartner._id
        });

        return res.status(201).json({
            message: 'Food created successfully',
            foodItem
        });
    } catch (error) {
        console.error('Food video upload failed:', error);
        return res.status(500).json({ message: 'Could not upload the food video. Please try again.' });
    }
}

async function getFood(req, res) {
    const foodItems = await foodmodel.find({ }).populate('foodPartner', 'name address');
    res.status(200).json({
        message: "Foods items fetched successfully",
        foods: foodItems
    });
}

async function getFoodByPartner(req, res) {
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
        return res.status(400).json({ message: 'Invalid food partner ID' });
    }

    const foodItems = await foodmodel
        .find({ foodPartner: partnerId })
        .populate('foodPartner', 'name address');

    res.status(200).json({
        message: "Food partner items fetched successfully",
        foods: foodItems
    });
}

async function getFoodPartnerProfile(req, res) {
    const foods = await foodmodel.find({ foodPartner: req.foodPartner._id });

    res.status(200).json({
        message: 'Food partner profile fetched successfully',
        partner: {
            _id: req.foodPartner._id,
            name: req.foodPartner.name,
            address: req.foodPartner.address,
            profilePhoto: req.foodPartner.profilePhoto
        },
        foods
    });
}

async function updateFoodPartnerPhoto(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Choose a profile photo to upload.' });
    }

    try {
        const uploadResult = await storageservice.uploadFile(req.file.buffer, uuidv4());
        const partner = await req.foodPartner.updateOne({
            profilePhoto: uploadResult.url,
            profilePhotoFileId: uploadResult.fileId
        });

        if (partner.matchedCount !== 1) {
            return res.status(404).json({ message: 'Food partner profile not found.' });
        }

        return res.status(200).json({
            message: 'Profile photo updated successfully.',
            profilePhoto: uploadResult.url
        });
    } catch (error) {
        console.error('Food partner photo upload failed:', error);
        return res.status(500).json({ message: 'Could not update the profile photo. Please try again.' });
    }
}

async function deleteFood(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
        return res.status(400).json({ message: 'Invalid food video ID.' });
    }

    const foodItem = await foodmodel.findOne({
        _id: req.params.foodId,
        foodPartner: req.foodPartner._id
    });

    if (!foodItem) {
        return res.status(404).json({ message: 'Food video not found.' });
    }

    await foodItem.deleteOne();

    if (foodItem.videoFileId) {
        try {
            await storageservice.deleteFile(foodItem.videoFileId);
        } catch (error) {
            console.error('Deleted food video asset could not be removed from storage:', error);
        }
    }

    return res.status(200).json({ message: 'Food video deleted successfully.' });
}

async function getFoodItems(req, res) {
    const foodItems = await foodmodel.find();

    res.status(200).json({
        message: "Food items fetched successfully",
        foods: foodItems
    });
}

async function likesFood(req, res) {
    const { foodId } = req.body;

    const like = await Like.create({
        user: req.user._id,
        food: foodId
    });
    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: userId,
            food: foodId
        })
        await foodmodel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })
    }

    res.status(201).json({
        message: "Food liked successfully",
        like
    });
}

async function saveFood(req, res) {
    const { foodId } = req.body;

    const like = await Like.create({
        user: req.user._id,
        food: foodId
    });
    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: userId,
            food: foodId
        })
        await foodmodel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })
    }

    res.status(201).json({
        message: "Food liked successfully",
        like
    });
}
module.exports = {
    createFood,
    getFood,
    getFoodByPartner,
    getFoodPartnerProfile,
    updateFoodPartnerPhoto,
    deleteFood,
    getFoodItems,
    likesFood,
    saveFood,
};