const foodPartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/users.models');
const jwt = require('jsonwebtoken');

async function authFoodPartner(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foodPartner = await foodPartnerModel.findById(decoded.id);

    if (!foodPartner) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.foodPartner = foodPartner;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function authUserMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { authFoodPartner, authUserMiddleware };
