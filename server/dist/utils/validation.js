"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.validatePhone = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return false;
    }
    return password.length >= 8;
};
exports.validatePassword = validatePassword;
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    const phoneRegex = /^010-?\d{4}-?\d{4}$/;
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
const validateObjectId = (id) => {
    if (!id || typeof id !== 'string') {
        return false;
    }
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};
exports.validateObjectId = validateObjectId;
//# sourceMappingURL=validation.js.map