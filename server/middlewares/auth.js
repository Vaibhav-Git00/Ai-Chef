const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "smartchef-secret-key");
        req.userId = decoded.userId;
        req.phone = decoded.phone;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

exports.optionalAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "smartchef-secret-key");
            req.userId = decoded.userId;
            req.phone = decoded.phone;
        }
        next();
    } catch (error) {
        // Token is invalid but optional, so continue
        next();
    }
};
