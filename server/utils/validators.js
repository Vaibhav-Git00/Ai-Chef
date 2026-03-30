exports.validatePhone = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    
    // Check if it's a valid phone (at least 10 digits)
    return cleaned.length >= 10 && cleaned.length <= 15;
};

exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.validatePassword = (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number
    if (!password || password.length < 8) {
        return false;
    }
    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }
    // At least one number
    if (!/[0-9]/.test(password)) {
        return false;
    }
    return true;
};

exports.sanitizePhone = (phone) => {
    // Remove all non-digit characters and keep only the last 10 digits
    return phone.replace(/\D/g, "").slice(-10);
};

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
