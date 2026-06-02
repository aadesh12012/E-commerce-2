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
 * Verify SMTP connection on server start
 */
async function verifyEmailConnection() {
    if (!isEmailConfigured()) {
        console.warn(
            "Email: skipped — add EMAIL and EMAIL_PASS to .env to enable"
        );
        return false;
    }

    try {
        await getTransporter().verify();
        console.log("✅ Email: Gmail SMTP connection verified");
        return true;
    } catch (err) {
        console.warn("Email: SMTP verification failed —", err.message);
        return false;
    }
}

module.exports = {
    getTransporter,
    isEmailConfigured,
    verifyEmailConnection,
};
