const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    body: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    clickActionUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Delete"],
      deafult: "Active",
    },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;