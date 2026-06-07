const mongoose = require("./backend/config/mongoose");
const User = require("./backend/models/User");
const Product = require("./backend/models/product");
const Order = require("./backend/models/order");

async function simulateVerifyPayment() {
    try {
        const userId = "6a153ca066d9e357a227fff2"; // aadesh7
        const user = await User.findById(userId).populate("cart.productId");
        
        console.log("SIMULATING verifyPayment for cart items:");
        const cartItems = user.cart;
        const razorpay_order_id = "fake_order_id";
        const razorpay_payment_id = "fake_payment_id";
        
        const savedOrders = [];
        for (const item of cartItems) {
            console.log("Item:", JSON.stringify(item, null, 2));
            
            // Check for missing productId
            if (!item.productId) {
                console.log("Warning: Cart item has no product or product was deleted, skipping");
                continue;
            }
            
            const productId = item.productId._id || item.productId;
            const sellerId = item.sellerId || (item.productId && item.productId.sellerId);
            const price = item.price || (item.productId && item.productId.price) || 0;
            const quantity = item.quantity || 1;
            const orderAmount = Number(price) * Number(quantity);
            
            console.log("Resolved fields:");
            console.log("  productId:", productId);
            console.log("  sellerId:", sellerId);
            console.log("  price:", price);
            console.log("  quantity:", quantity);
            console.log("  orderAmount:", orderAmount);
            
            const newOrder = await Order.create({
                userId: userId,
                productId: productId,
                sellerId: sellerId || "000000000000000000000000",
                amount: orderAmount,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                paymentStatus: "successful"
            });
            console.log("Order created successfully:", newOrder._id);
            savedOrders.push(newOrder);
            
            // Simulating decrease product quantity
            const product = await Product.findById(productId);
            if (product) {
                console.log("Product found in DB. Current quantity:", product.quantity);
                const newQty = Math.max(0, product.quantity - quantity);
                console.log("New quantity should be:", newQty);
            } else {
                console.log("Product not found in DB!");
            }
        }
        console.log("Simulation finished successfully!");
    } catch (e) {
        console.error("Simulation failed with error:");
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

simulateVerifyPayment();
