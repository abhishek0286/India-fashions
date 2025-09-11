const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    redirectType: {
      type: String,
      enum: ["category"],
      default: "category"
    },
    redirectValue: { type: String }, // optional: e.g., slug
    displayOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
