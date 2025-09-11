const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderNumber: {
    type: String,
    required: true,
    // unique: true
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
    default: "Pending"
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],

  // subtotal: { 
  //   type: Number, 
  //   required: true 
  // },
  // discount: {
  //    type: Number, 
  //    default: 0 
  //   },
  shippingFee: {
    type: Number,
    default: 0
  },
  GSTAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // couponCode: {
  //   type: String
  // },
  // couponDiscount: {
  //   type: Number, default: 0
  // },
  shippingAddress: {
    type: Object,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["Cash On Delivery", "Online"],
    default: "Cash On Delivery"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending"
  },
  transactionId:
  {
    type: String

  },
  // New fields
  deliveredAt: {
    type: Date
  },
  expectedDelivery: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  returnReason: {
    type: String
  },
  returnedAt: {
    type: Date
  },
  statusHistory: [
    {
      status: { type: String },
      changedAt: { type: Date, default: Date.now }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
