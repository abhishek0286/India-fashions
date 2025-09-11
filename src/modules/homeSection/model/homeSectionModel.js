const mongoose = require("mongoose");

const homeSectionSchema = new mongoose.Schema(
  {
    sectionType: {
      type: String,
      default : "",
    },
    title: { type: String, required: true },
    bannerImage: { type: String }, // Optional banner for section
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    displayOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeSection", homeSectionSchema);
