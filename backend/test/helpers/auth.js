const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { ROLE_STAFF, ROLE_ADMIN } = require('../../constants');

const createUser = async ({
    firstName = 'Test',
    lastName = 'User',
    email,
    password = 'password123',
    role = ROLE_STAFF,
    active = true,
} = {}) => {
    return User.create({
        firstName,
        lastName,
        email: email || `${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
        password,
        role,
        active,
    });
};

const tokenFor = (user) =>
    jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

const createStaffUser = (overrides = {}) => createUser({ ...overrides, role: ROLE_STAFF });
const createAdminUser = (overrides = {}) => createUser({ ...overrides, role: ROLE_ADMIN });

module.exports = {
    createUser,
    createStaffUser,
    createAdminUser,
    tokenFor,
    authHeader,
};
