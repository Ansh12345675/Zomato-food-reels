const userModel = require('../models/users.models');
const foodPartnerModel = require('../models/foodpartner.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authCookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
};

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const isUserAlreadyRegistered = await userModel.findOne({ email });
    if (isUserAlreadyRegistered) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    res.cookie('token', token);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token);

    return res.status(200).json({
      message: 'User logged in successfully',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function logoutUser(req, res) {
  res.clearCookie('token', authCookieOptions);
  return res.status(200).json({ message: 'User logged out successfully' });
}

async function registerFoodPartner(req, res) {
  try {
    const { name, email, password, ContactName, phone, address } = req.body;

    if (!name || !email || !password || !ContactName || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const isAccountAlreadyRegistered = await foodPartnerModel.findOne({ email });
    if (isAccountAlreadyRegistered) {
      return res.status(400).json({ message: 'Food partner already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({
      name,
      ContactName,
      phone,
      address,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
    res.cookie('token', token, authCookieOptions);

    return res.status(201).json({
      message: 'Food partner registered successfully',
      user: {
        _id: foodPartner._id,
        email: foodPartner.email,
        name: foodPartner.name,
        address: foodPartner.address,
        phone: foodPartner.phone,
        ContactName: foodPartner.ContactName,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function loginFoodPartner(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const foodPartner = await foodPartnerModel.findOne({ email });
    if (!foodPartner) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, foodPartner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
    res.cookie('token', token, authCookieOptions);

    return res.status(200).json({
      message: 'Food partner logged in successfully',
      user: {
        _id: foodPartner._id,
        email: foodPartner.email,
        name: foodPartner.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
};
