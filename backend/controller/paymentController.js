const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const User = require("../models/User");
const Product = require("../models/product");

// Validate Razorpay credentials
if (!process.env.KEY_ID) {
    console.warn("⚠️ WARNING: Razorpay KEY_ID is not set!");
}
if (!process.env.KEY_SECRET) {
    console.warn("⚠️ WARNING: Razorpay KEY_SECRET is not set!");
}

const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        // Check if API keys are configured
        if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Razorpay API keys are not configured. Please add KEY_ID and KEY_SECRET to .env file."
            });
        }

        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount provided"
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay accepts in paise
            currency: "INR"
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
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

        // Verify the signature
        const key_secret = process.env.KEY_SECRET;
        if (!key_secret) {
            return res.status(500).json({
                success: false,
                message: "Razorpay KEY_SECRET is not configured on the server."
            });
        }
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Signature verification failed"
            });
        }

        // Payment is verified! Now save orders to MongoDB
        const savedOrders = [];
        for (const item of cartItems) {
            // Note: item contains: productId, sellerId, price, quantity
            // Check if sellerId exists, else fall back to item.productId.sellerId
            const productId = item.productId._id || item.productId;
            const sellerId = item.sellerId || (item.productId && item.productId.sellerId);
            const price = item.price || (item.productId && item.productId.price) || 0;
            const quantity = item.quantity || 1;
            const orderAmount = Number(price) * Number(quantity);
            
            if (!sellerId) {
                console.log("Warning: Product has no sellerId, skipping order creation or using fallback admin sellerId");
            }

            const newOrder = await Order.create({
                userId: userId,
                productId: productId,
                sellerId: sellerId || "000000000000000000000000", // Fallback if no sellerId
                amount: orderAmount,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                paymentStatus: "successful"
            });
            savedOrders.push(newOrder);

            // Decrease product quantity
            const product = await Product.findById(productId);
            if (product) {
                product.quantity = Math.max(0, product.quantity - quantity);
                
                // Delete product if quantity reaches 0
                if (product.quantity === 0) {
                    await Product.findByIdAndDelete(productId);
                    console.log(`Product ${productId} deleted due to zero quantity`);
                } else {
                    await product.save();
                }
            }
        }

        // Clear the user's cart
        const user = await User.findById(userId);
        if (user) {
            user.cart = [];
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "Payment verified and order saved successfully!",
            orders: savedOrders
        });

    } catch (error) {
        console.log("Error in verifyPayment:", error);
        res.status(500).json({
            success: false,
            message: "Verification failed",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};