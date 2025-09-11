const mongoose = require("mongoose");

const productAttributeSchema = new mongoose.Schema(
  {
    hasColors: { type: Boolean, default: false },
    hasSizes: { type: Boolean, default: false },
    colors: { type: [String], default: [] }, // e.g. ["Red","Blue"]
    sizes: { type: [String], default: [] },  // e.g. ["S","M","L","XL"]
    material: { type: String, default: "" },
    brand: { type: String, default: "" },
    extra: { type: Object, default: {} },    // any additional dynamic attributes
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    images: { type: [String], default: [] },

    attributes: { type: productAttributeSchema, default: () => ({}) },

    // denormalized review summary for fast reads
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    status: { type: String, enum: ["Active", "Delete"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
