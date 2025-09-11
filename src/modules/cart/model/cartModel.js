const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" }, // optional if no variants
        quantity: { type: Number, default: 1, min: 1 }
      }
    ],
    status: {
      type: String,
      enum: ["Active", "CheckedOut"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
