const OtpModel = require("../models/Otp");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { sendOtpEmail } = require("../services/emailService");
const { isEmailConfigured } = require("../config/mailer");

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const PURPOSE = {
    USER_REGISTER: "user-register",
    SELLER_REGISTER: "seller-register",
};

function normalizeEmail(email) {
    return String(email).trim().toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendRegistrationOtp(email, purpose, existsCheck) {
    if (!email) {
        return { status: 400, body: { success: false, message: "Email is required" } };
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
        return {
            status: 400,
            body: { success: false, message: "Invalid email address" },
        };
    }

    const exists = await existsCheck(normalizedEmail);
    if (exists) {
        return { status: 200, body: { success: false, message: exists.message } };
    }

    const existingOtp = await OtpModel.findOne({
        email: normalizedEmail,
        purpose,
    });

    if (
        existingOtp &&
        Date.now() - new Date(existingOtp.updatedAt).getTime() <
            OTP_RESEND_COOLDOWN_MS
    ) {
        return {
            status: 429,
            body: {
                success: false,
                message: "Please wait 60 seconds before requesting a new OTP",
            },
        };
    }

    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });

    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OtpModel.findOneAndUpdate(
        { email: normalizedEmail, purpose },
        { otpHash, expiresAt, purpose },
        { upsert: true, returnDocument: 'after' }
    );

    // Send OTP email via Nodemailer
    if (isEmailConfigured()) {
        const mailResult = await sendOtpEmail(normalizedEmail, otp);
        if (!mailResult.success) {
            console.warn("⚠️ OTP email failed:", mailResult.error);
            // Log OTP to console for testing (especially on Render where Gmail might be blocked)
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📧 OTP for ${normalizedEmail}:`);
            console.log(`🔐 OTP: ${otp}`);
            console.log(`⏰ Expires in: ${OTP_EXPIRY_MINUTES} minutes`);
            console.log(`${'='.repeat(60)}\n`);
            // Don't fail - allow registration to continue
        }
    } else {
        console.warn("⚠️ Email not configured");
    }

    return {
        status: 200,
        body: {
            success: true,
            message: `OTP sent to ${normalizedEmail}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        },
    };
}

async function verifyRegistrationOtp(email, otp, purpose) {
    const normalizedEmail = normalizeEmail(email);

    if (!otp) {
        return { valid: false, message: "OTP is required", email: normalizedEmail };
    }

    const otpRecord = await OtpModel.findOne({
        email: normalizedEmail,
        purpose,
    });

    if (!otpRecord) {
        return {
            valid: false,
            message: "OTP not found. Please request a new OTP.",
            email: normalizedEmail,
        };
    }

    if (otpRecord.expiresAt < new Date()) {
        await OtpModel.deleteOne({ email: normalizedEmail, purpose });
        return {
            valid: false,
            message: "OTP has expired. Please request a new OTP.",
            email: normalizedEmail,
        };
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), otpRecord.otpHash);

    if (!isOtpValid) {
        return {
            valid: false,
            message: "Invalid OTP. Please check and try again.",
            email: normalizedEmail,
        };
    }

    return { valid: true, email: normalizedEmail };
}

async function clearRegistrationOtp(email, purpose) {
    await OtpModel.deleteOne({ email: normalizeEmail(email), purpose });
}

module.exports = {
    PURPOSE,
    normalizeEmail,
    isValidEmail,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    clearRegistrationOtp,
};
