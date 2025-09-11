const mongoose = require("mongoose");

let policySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);

const policyModel = mongoose.model("PrivacyPolicy", policySchema);

module.exports = policyModel;
