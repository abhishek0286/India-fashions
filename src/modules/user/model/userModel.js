const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  addressType: { type: String }, // Home, Work, etc.
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: "India" },
});

const paymentMethodSchema = new mongoose.Schema({
  cardType: { type: String }, // Visa, MasterCard
  cardNumber: { type: String }, // Mask before sending to client
  expiry: { type: String }, // MM/YY
});

const userSchema = new mongoose.Schema(
  {
    profilePhoto: { type: String, default: "" },
    fullName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    dob: { type: Date },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    resetPasswordEntry: {
      resetPasswordToken: {
        type: String,
        default: "",
      },
      resetPasswordExpires: {
        type: Date,
        default: null,
      },
    },
    status: { type: String, enum: ["Active", "Delete"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
