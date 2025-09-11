const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true, 
      index: true 
    },
      sku: {
         type: String, 
         required: true, 
         trim: true 
        },

    // attribute combo (optional fields)
    color: { 
      type: String, 
      default: "" 
    },
    size: {
       type: String, 
       default: "" 
      },

    // pricing
    originalPrice: { 
      type: Number, 
      required: true 
    },
    discountPrice: 
    { type: Number, 
      required: true 
    }, // <= originalPrice

    // inventory
    stock: 
    { type: Number,
       default: 0, 
       min: 0 
      },

    status: { 
      type: String, 
      enum: ["Active", "Delete"], 
      default: "Active" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Variant", variantSchema);
