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

const allowedOrigins = process.env.FRONTEND_URLS 
    ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${NODE_ENV} mode`);
    verifyEmailConnection();
});