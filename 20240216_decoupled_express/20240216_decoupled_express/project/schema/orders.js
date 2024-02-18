const mongoose = require("mongoose");

const orders = new mongoose.Schema({
    date:{
        type:Date,
        default: Date.now()
    },
    address: {
        type: String,
        required: true,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    total_count: {
        type: Number,
        min: 1,
        required: true
    },
    delivery_status: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("orders",orders);