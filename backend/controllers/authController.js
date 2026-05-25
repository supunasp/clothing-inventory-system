const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {ROLE_STAFF} = require('../constants');
const logger = require("../utils/logger");

const registerUser = async (req, res) => {
    const {firstName, lastName, email, password} = req.body;
    try {
        const userExists = await User.findOne({email});
        if (userExists) return res.status(400).json({message: 'User already exists'});

        const user = await User.create(
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                active: true,
                role: ROLE_STAFF
            });
        res.status(201).json(convertToUserResponse(user));
    } catch (error) {
        logger.error('Error registering user:', error);
        res.status(500).json({message: error.message});
    }
};

const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json(convertToUserResponse(user));
        } else {
            res.status(401).json({message: 'Invalid email or password'});
        }
    } catch (error) {
        logger.error('Error logging in user:', error);
        res.status(500).json({message: error.message});
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json(convertToUserResponse(user));
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({message: 'User not found'});

        const {firstName, lastName, email, active, role} = req.body;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.active = active !== undefined ? active : user.active;
        user.role = role || user.role;

        const updatedUser = await user.save();
        res.json(convertToUserResponse(updatedUser));
    } catch (error) {
        logger.error('Error updating user profile:', error);
        res.status(500).json({message: error.message});
    }
};

const convertToUserResponse = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    active: user.active,
    role: user.role,
    token: generateToken(user.id)
});

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'});
};

module.exports = {registerUser, loginUser, updateUserProfile, getProfile};
