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

        if (!name || !email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and OTP are required",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
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
            return res.json({
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

        await clearRegistrationOtp(normalizedEmail, PURPOSE.USER_REGISTER);

        let token = jwt.sign(
            {
                email: normalizedEmail,
                userid: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET || "nahibatauga"
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        sendWelcomeEmail(normalizedEmail, name).catch((err) =>
            console.warn("Welcome email failed:", err.message)
        );

        res.json({
            success: true,
            message:
                "Account verified and created successfully. Check your email for a welcome message.",
            user,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email: normalizeEmail(email) });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid credentials",
            });
        }

        let token = jwt.sign(
            {
                email: user.email,
                userid: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET || "nahibatauga"
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        return res.json({
            success: true,
            message: "Login successful",
            user,
        });
    } catch (err) {
        console.log(err);
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
