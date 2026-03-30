const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smartchef-secret-key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "30d";

/**
 * Generate JWT token
 */
exports.generateToken = (userId, phone) => {
    return jwt.sign(
        { userId, phone },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};

/**
 * Generate Refresh Token (longer validity)
 */
exports.generateRefreshToken = (userId, phone) => {
    return jwt.sign(
        { userId, phone },
        JWT_SECRET,
        { expiresIn: "90d" }
    );
};

/**
 * Verify token
 */
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

/**
 * Decode token without verification (for development)
 */
exports.decodeToken = (token) => {
    return jwt.decode(token);
};
