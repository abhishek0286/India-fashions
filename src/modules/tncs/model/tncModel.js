const mongoose = require("mongoose");

let termSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Term = mongoose.model("Term", termSchema);

module.exports = Term;
