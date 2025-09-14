const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" }, // optional if no variants
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
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
