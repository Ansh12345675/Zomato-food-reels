const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/users/register', authController.registerUser);
router.post('/users/login', authController.loginUser);
router.get('/users/logout', authController.logoutUser);

router.post('/food-partners/register', authController.registerFoodPartner);
router.post('/food-partners/login', authController.loginFoodPartner);
router.get('/food-partners/logout', authController.logoutUser);

module.exports = router;