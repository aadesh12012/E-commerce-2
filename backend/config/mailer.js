const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Returns true when EMAIL and EMAIL_PASS are set
 */
function isEmailConfigured() {
    return Boolean(process.env.EMAIL && process.env.EMAIL_PASS);
}

/**
 * Get Nodemailer transporter (singleton)
 */
function getTransporter() {
    if (!isEmailConfigured()) {
        throw new Error(
            "Email is not configured. Set EMAIL and EMAIL_PASS in .env"
        );
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS, // Gmail app password
            },
        });
    }

    return transporter;
}

/**
 * Email is disabled temporarily — OTP is logged to console/Render logs instead
 */
async function verifyEmailConnection() {
    console.log("📋 Email: disabled — OTP will appear in Render server logs");
    return false;
}

module.exports = {
    getTransporter,
    isEmailConfigured,
    verifyEmailConnection,
};
