// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   orderId: { type: String, required: true, unique: true },
//   status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
//   totalAmount: { type: Number, required: true },
//   items: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
//       quantity: { type: Number, required: true },
//       price: { type: Number, required: true }
//     }
//   ],
//   shippingAddress: { type: Object, required: true },
//   paymentMethod: { type: String },
//   transactionId: { type: String },
// }, { timestamps: true });

// module.exports = mongoose.model("Order", orderSchema);


const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"], 
    default: "Pending" 
  },
  totalAmount: { type: Number, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  shippingAddress: { type: Object, required: true },
  paymentMethod: { type: String },
  transactionId: { type: String },

  // New fields
  cancelledAt: { type: Date },
  returnReason: { type: String },
  returnedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
