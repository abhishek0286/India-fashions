const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["Active", "Delete"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
