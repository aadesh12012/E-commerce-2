const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/emailService");
const {
    PURPOSE,
    isValidEmail,
    normalizeEmail,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    clearRegistrationOtp,
} = require("../utils/otpHelper");

const sendRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await sendRegistrationOtp(
            email,
            PURPOSE.USER_REGISTER,
            async (normalizedEmail) => {
                const existing = await UserModel.findOne({ email: normalizedEmail });
                if (existing) {
                    return {
                        message: "User already exists with this email",
                    };
                }
                return null;
            }
        );
        return res.status(result.status).json(result.body);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        let { name, email, password, otp, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // OTP verification is required
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required. Please send OTP to your email first.",
            });
        }

        const otpCheck = await verifyRegistrationOtp(
            email,
            otp,
            PURPOSE.USER_REGISTER
        );

        if (!otpCheck.valid) {
            return res.status(400).json({
                success: false,
                message: otpCheck.message,
            });
        }

        const normalizedEmail = otpCheck.email;

        let existingUser = await UserModel.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists",
            });
        }

        let hashpassword = await bcrypt.hash(password, 10);

        let user = await UserModel.create({
            name,
            email: normalizedEmail,
            password: hashpassword,
            role: role || "user",
        });

        // Clear OTP after successful registration
        await clearRegistrationOtp(normalizedEmail, PURPOSE.USER_REGISTER);

        // Ensure JWT_SECRET is set
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET is not set in environment!");
            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        let token = jwt.sign(
            {
                email: normalizedEmail,
                userid: user._id,
                role: user.role,
            },
            jwtSecret,
            { expiresIn: "7d" }  // Add expiration for security
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        });

        sendWelcomeEmail(normalizedEmail, name).catch((err) =>
            console.warn("Welcome email failed:", err.message)
        );

        console.log(`✅ User registered successfully: ${normalizedEmail}`);

        res.status(201).json({
            success: true,
            message:
                "Account created successfully. Check your email for a welcome message.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await UserModel.findOne({ email: normalizeEmail(email) });

        if (!user) {
            console.warn(`Login attempt for non-existent user: ${email}`);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.warn(`Failed login attempt for user: ${email}`);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Ensure JWT_SECRET is set
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET is not set in environment!");
            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        let token = jwt.sign(
            {
                email: user.email,
                userid: user._id,
                role: user.role,
            },
            jwtSecret,
            { expiresIn: "7d" }  // Add expiration for security
        );

        const isProduction = process.env.NODE_ENV === "production";
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,      // Only send over HTTPS in production
            sameSite: isProduction ? "none" : "lax",  // Cross-origin safe in production
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        });

        console.log(`✅ User logged in successfully: ${user.email}`);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = {
    sendRegisterOtp,
    createUser,
    loginUser,
};
