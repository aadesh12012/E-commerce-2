require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("./config/mongoose");
const { verifyEmailConnection } = require("./config/mailer");

app.use(cookieParser());
app.use(express.json());

// Environment validation
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "nahibatauga") {
    console.warn("⚠️ WARNING: JWT_SECRET is not set or using unsafe default!");
}

if (!process.env.MONGO_URL) {
    console.warn("⚠️ WARNING: MONGO_URL is not set!");
}

// Configure allowed origins - CRITICAL for production
const allowedOrigins = process.env.FRONTEND_URLS 
    ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
    : process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"] // Set explicitly in production
        : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

console.log(`CORS Origins: ${allowedOrigins.join(", ")}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set - defaulting to development"}`);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS Blocked - Origin not in allowlist: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

const userRouter = require("./routes/userRouter");
const sellerRouter = require("./routes/sellerRoutes");
const cartRouter = require("./routes/cartRouter");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRouter = require("./routes/adminRouter");

app.use("/",adminRouter);
app.use("/",paymentRoutes);
app.use("/", userRouter);
app.use("/", sellerRouter);
app.use("/", cartRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ 
        success: false, 
        message: process.env.NODE_ENV === "production" 
            ? "Internal server error" 
            : err.message 
    });
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`✅ Server started on port ${PORT} in ${NODE_ENV} mode`);
    verifyEmailConnection();
});