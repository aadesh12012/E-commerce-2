const { getTransporter, isEmailConfigured } = require("../config/mailer");
const { productDeletedTemplate } = require("../templates/productDeletedEmail");
const { welcomeEmailTemplate } = require("../templates/welcomeEmail");
const { otpEmailTemplate } = require("../templates/otpEmail");

/**
 * Sends an email via Resend. Skips silently when not configured.
 * Never throws — callers can await without breaking main flows.
 */
async function sendEmail({ to, subject, html, text }) {
    if (!isEmailConfigured()) {
        console.warn("Email skipped (not configured):", subject);
        return { success: false, skipped: true };
    }

    if (!to) {
        console.warn("Email skipped (no recipient):", subject);
        return { success: false, skipped: true };
    }

    try {
        const resend = getTransporter();
        const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

        const response = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        return { success: true, messageId: response.data?.id };
    } catch (err) {
        console.error("Email send failed:", err.message);
        return { success: false, error: err.message };
    }
}

/** Confirmation when a seller deletes a product from their dashboard */
async function sendProductDeletedEmail(sellerEmail, productName) {
    const { subject, html, text } = productDeletedTemplate(productName);

    return sendEmail({
        to: sellerEmail,
        subject,
        html,
        text,
    });
}

/** Welcome email after user registration */
async function sendWelcomeEmail(userEmail, userName) {
    const { subject, html, text } = welcomeEmailTemplate(userName);

    return sendEmail({
        to: userEmail,
        subject,
        html,
        text,
    });
}

/** OTP email for registration verification */
async function sendOtpEmail(userEmail, otp) {
    const { subject, html, text } = otpEmailTemplate(otp);

    return sendEmail({
        to: userEmail,
        subject,
        html,
        text,
    });
}

module.exports = {
    sendEmail,
    sendProductDeletedEmail,
    sendWelcomeEmail,
    sendOtpEmail,
};
