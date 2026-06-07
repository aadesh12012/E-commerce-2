const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const User = require("../models/User");
const Product = require("../models/product");

if (!process.env.KEY_ID)     console.warn("⚠️  WARNING: Razorpay KEY_ID is not set!");
if (!process.env.KEY_SECRET) console.warn("⚠️  WARNING: Razorpay KEY_SECRET is not set!");

const razorpay = new Razorpay({
    key_id:     process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Razorpay API keys are not configured."
            });
        }

        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount provided" });
        }

        const options = { amount: Math.round(amount * 100), currency: "INR" };
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cartItems,
            userId
        } = req.body;

        // ── 1. Validate required fields ──────────────────────────────────────
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment fields" });
        }
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }

        // ── 2. Verify Razorpay signature ─────────────────────────────────────
        const key_secret = process.env.KEY_SECRET;
        if (!key_secret) {
            return res.status(500).json({ success: false, message: "Razorpay KEY_SECRET is not configured." });
        }

        const body             = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret.trim())   // .trim() removes accidental whitespace
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            console.error("Signature mismatch", { expectedSignature, razorpay_signature });
            return res.status(400).json({ success: false, message: "Signature verification failed" });
        }

        // ── 3. Save orders ───────────────────────────────────────────────────
        const savedOrders = [];

        for (const item of cartItems) {
            try {
                // productId may be a plain ID string or a populated object
                const productId =
                    item.productId?._id?.toString()
                    ?? item.productId?.toString()
                    ?? null;

                if (!productId) {
                    console.warn("Skipping item — no productId:", item);
                    continue;
                }

                // sellerId: prefer top-level field, then nested in populated productId
                const sellerId =
                    item.sellerId?.toString()
                    ?? item.productId?.sellerId?.toString()
                    ?? null;

                const price    = Number(item.price ?? item.productId?.price ?? 0);
                const quantity = Number(item.quantity ?? 1);
                const orderAmount = price * quantity;

                const newOrder = await Order.create({
                    userId,
                    productId,
                    sellerId:      sellerId ?? "000000000000000000000000",
                    amount:        orderAmount,
                    paymentId:     razorpay_payment_id,
                    orderId:       razorpay_order_id,
                    paymentStatus: "successful"
                });
                savedOrders.push(newOrder);

                // ── 4. Decrease / delete product quantity ────────────────────
                const product = await Product.findById(productId);
                if (product) {
                    product.quantity = Math.max(0, product.quantity - quantity);
                    if (product.quantity === 0) {
                        await Product.findByIdAndDelete(productId);
                        console.log(`Product ${productId} deleted — zero quantity`);
                    } else {
                        await product.save();
                    }
                }
            } catch (itemErr) {
                // Don't abort the whole payment — log and continue
                console.error("Error processing cart item:", itemErr, item);
            }
        }

        // ── 5. Clear user cart ───────────────────────────────────────────────
        const user = await User.findById(userId);
        if (user) {
            user.cart = [];
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "Payment verified and order saved successfully!",
            orders:  savedOrders
        });

    } catch (error) {
        console.error("Error in verifyPayment:", error);
        res.status(500).json({
            success: false,
            message: "Verification failed",
            error:   error.message
        });
    }
};

module.exports = { createOrder, verifyPayment };