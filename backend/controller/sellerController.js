const mongoose = require("mongoose");
const ProductModel = require("../models/product");
const SellerModel = require("../models/sellerlogin");
const OrderModel = require("../models/order");
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { deleteProductImage } = require("../utils/deleteProductImage");
const { sendProductDeletedEmail } = require("../services/emailService");
const {
    PURPOSE,
    isValidEmail,
    normalizeEmail,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    clearRegistrationOtp,
} = require("../utils/otpHelper");

const addproduct = async (req, res) => {
    try {
        const { name, price, info, quantity } = req.body;

        // Check Product Exists
        const existingProduct = await ProductModel.findOne({ name });
        if (existingProduct) {
            return res.json({
                success: false,
                message: "Product Already Exists"
            });
        }

        // Use uploaded file or provided URL
        const productImage = req.file ? req.file.filename : req.body.image;

        // Create Product with sellerId
        const product = await ProductModel.create({
            name,
            price,
            image: productImage,
            info,
            quantity: parseInt(quantity) || 0,
            sellerId: req.seller.id // From isSeller middleware
        });

        res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const listproduct = async (req, res) => {
    try {
        const products = await ProductModel.find({ quantity: { $gt: 0 } }).populate("sellerId", "name email");
        res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Send OTP before seller registration
const sendSellerRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await sendRegistrationOtp(
            email,
            PURPOSE.SELLER_REGISTER,
            async (normalizedEmail) => {
                const existing = await SellerModel.findOne({
                    email: normalizedEmail,
                });
                if (existing) {
                    return { message: "Seller already exists with this email" };
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

const sellerregister = async (req, res) => {
    try {
        const { name, email, password, phone, businessName, address, otp } =
            req.body;

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !businessName ||
            !address ||
            !otp
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields including OTP are required",
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
            PURPOSE.SELLER_REGISTER
        );

        if (!otpCheck.valid) {
            return res.status(400).json({
                success: false,
                message: otpCheck.message,
            });
        }

        const normalizedEmail = otpCheck.email;

        const existingSeller = await SellerModel.findOne({
            email: normalizedEmail,
        });
        if (existingSeller) {
            return res.json({
                success: false,
                message: "Email already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = await SellerModel.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            businessName,
            address,
            businessLogo: req.file ? req.file.filename : ""
        });

        await clearRegistrationOtp(normalizedEmail, PURPOSE.SELLER_REGISTER);

        // JWT Token
        const token = jwt.sign(
            {
                id: seller._id,
                email: seller.email
            },
            process.env.JWT_SECRET_SELLER || "secretkey",
            {
                expiresIn: "2d"
            }
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(201).json({
            success: true,
            message: "Seller account verified and registered successfully",
            seller,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const sellerlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({
                success: false,
                message: "Email and password are required"
            });
        }

        const seller = await SellerModel.findOne({ email: normalizeEmail(email) });
        if (!seller) {
            return res.json({
                success: false,
                message: "Seller not found"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, seller.password);
        if (!passwordMatch) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }

        // JWT Token
        const token = jwt.sign(
            {
                id: seller._id,
                email: seller.email
            },
            process.env.JWT_SECRET_SELLER || "secretkey",
            {
                expiresIn: "2d"
            }
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.json({
            success: true,
            message: "Login Successful",
            seller
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Save seller payment details
const savePayoutDetails = async (req, res) => {
    try {
        const { upiId, bankAccount, ifscCode, accountHolderName } = req.body;
        const sellerId = req.seller.id;

        const seller = await SellerModel.findByIdAndUpdate(
            sellerId,
            {
                upiId,
                bankAccount,
                ifscCode,
                accountHolderName
            },
            { new: true }
        );

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payout details saved successfully",
            seller
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Fetch seller earnings
const getEarnings = async (req, res) => {
    try {
        const sellerId = req.seller.id;

        // Fetch successful orders for this seller
        const orders = await OrderModel.find({
            sellerId: sellerId,
            paymentStatus: "successful"
        });

        // Sum the order amounts
        const totalEarnings = orders.reduce((sum, order) => sum + order.amount, 0);

        // Fetch seller details for transferred earnings
        const seller = await SellerModel.findById(sellerId);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }
        
        const transferredEarnings = seller.earningsTransferred || 0;
        const pendingEarnings = totalEarnings - transferredEarnings;

        res.status(200).json({
            success: true,
            totalEarnings,
            transferredEarnings,
            pendingEarnings
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// List products owned by the authenticated seller
const getSellerProducts = async (req, res) => {
    try {
        const products = await ProductModel.find({ sellerId: req.seller.id })
            .sort({ _id: -1 });

        res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Delete a product — only if it belongs to the authenticated seller
const deleteSellerProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Authorization: seller may only delete their own listings
        if (product.sellerId.toString() !== req.seller.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this product"
            });
        }

        // Remove orphaned cart references so users don't see broken cart items
        await UserModel.updateMany(
            {},
            { $pull: { cart: { productId: id } } }
        );

        // Delete local image file when stored under /uploads (external URLs are skipped)
        if (product.image) {
            await deleteProductImage(product.image);
        }

        const productName = product.name;
        const sellerEmail = req.seller.email;

        await ProductModel.findByIdAndDelete(id);

        // Notify seller by email (non-blocking — delete succeeds even if mail fails)
        if (sellerEmail) {
            sendProductDeletedEmail(sellerEmail, productName).catch((err) =>
                console.warn("Product delete email failed:", err.message)
            );
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to delete product"
        });
    }
};

// Fetch seller orders
const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.seller.id;

        const orders = await OrderModel.find({ sellerId })
            .populate("productId", "name price image info")
            .populate("userId", "name email");

        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    addproduct,
    listproduct,
    sendSellerRegisterOtp,
    sellerregister,
    sellerlogin,
    savePayoutDetails,
    getEarnings,
    getSellerOrders,
    getSellerProducts,
    deleteSellerProduct
};