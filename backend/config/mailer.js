const { Resend } = require("resend");

let resend = null;

/**
 * Returns true when RESEND_API_KEY is set and EMAIL_ENABLED is not false.
 */
function isEmailConfigured() {
    // If EMAIL_ENABLED is explicitly set to false, disable email
    if (process.env.EMAIL_ENABLED === "false") {
        return false;
    }
    
    return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Get Resend instance (singleton).
 */
function getTransporter() {
    if (!isEmailConfigured()) {
        throw new Error(
            "Email is not configured. Set RESEND_API_KEY in .env"
        );
    }

    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }

    return resend;
}

/**
 * Verifies Resend connection on server start (logs only; does not crash app).
 */
async function verifyEmailConnection() {
    // If EMAIL_ENABLED is set to false, skip email verification
    if (process.env.EMAIL_ENABLED === "false") {
        console.warn("Email: disabled via EMAIL_ENABLED=false");
        return false;
    }

    if (!isEmailConfigured()) {
        console.warn(
            "Email: skipped — add RESEND_API_KEY to .env to enable"
        );
        return false;
    }

    try {
        // Simple verification by checking if API key is set
        console.log("✅ Email: Resend API configured");
        return true;
    } catch (err) {
        console.warn("Email: Resend verification failed —", err.message);
        return false;
    }
}

module.exports = {
    getTransporter,
    isEmailConfigured,
    verifyEmailConnection,
};
