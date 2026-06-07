const mongoose = require("../config/mongoose");

const userSchema = mongoose.Schema({    
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: "user"
    },
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "seller"
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
    

});
module.exports =
  mongoose.models.user ||
  mongoose.model("user", userSchema); 