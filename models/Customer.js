const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'wallet'],
      default: 'upi',
    },
    orderTotal: {
      type: Number,
      default: 0,
    },
    items: [
      {
        id: String,
        title: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    razorpay_payment_id: { type: String },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);
