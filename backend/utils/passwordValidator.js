const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RULES_MESSAGE =
    'Password must be at least 8 characters and include at least one letter and one digit.';

const isPasswordValid = (password) => {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        return false;
    }
    return /[A-Za-z]/.test(password) && /\d/.test(password);
};

module.exports = {
    PASSWORD_MIN_LENGTH,
    PASSWORD_RULES_MESSAGE,
    isPasswordValid,
};
