const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique : true
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;

adminModel.findOne({
  email: "admin@gmail.com",
})
  .then(async (response) => {
    if (response) {
      console.log("Admin already exists");
    } else {
      const password = await bcrypt.hash(
        "Admin@1234",
        Number.parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );
      const admin = new adminModel({
        email: "admin@gmail.com",
        password,
      });
      await admin.save();
      console.log("Admin created successfully");
    }
  })
  .catch((err) => {
    console.log("Error while creating admin", err);
  });
