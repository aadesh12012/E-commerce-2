const jwt = require("jsonwebtoken");

const isUser = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Access Denied: Please login first" 
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET is not set!");
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error" 
            });
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // Contains email, userid, role
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired. Please login again." 
            });
        }
        console.error("Token verification error:", err.message);
        return res.status(403).json({ 
            success: false, 
            message: "Invalid or Expired Token" 
        });
    }
};

const isSeller = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Access Denied: Please login first" 
            });
        }

        // Sellers login with JWT_SECRET_SELLER
        const jwtSellerSecret = process.env.JWT_SECRET_SELLER;
        if (!jwtSellerSecret) {
            console.error("CRITICAL: JWT_SECRET_SELLER is not set!");
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error" 
            });
        }

        const decoded = jwt.verify(token, jwtSellerSecret);
        req.seller = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired. Please login again." 
            });
        }
        console.error("Seller token verification error:", err.message);
        return res.status(403).json({ 
            success: false, 
            message: "Access Denied: Seller authentication failed" 
        });
    }
};

const isAdmin = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Access Denied: Please login first" 
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET is not set!");
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error" 
            });
        }

        const decoded = jwt.verify(token, jwtSecret);
        
        if (decoded.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Admin only" 
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired. Please login again." 
            });
        }
        console.error("Admin token verification error:", err.message);
        return res.status(403).json({ 
            success: false, 
            message: "Invalid or Expired Token" 
        });
    }
};

module.exports = {
    isUser,
    isSeller,
    isAdmin
};
