const Notification = require("../model/notificationModel");
const Admin = require("../../admin/model/adminModel");
const User = require("../../user/model/userModel");
const ResponseHandler = require("../../../utils/ResponseHandler");
const { sendToTopic } = require("../../../../config/firebase/topicMessaging");

exports.sendNotificationToAll = async (req, res) => {
  try {
    const token = req.token;

    const admin = await Admin.findOne({ _id: token._id });

    if (!admin) {
      return ResponseHandler.failed(res, "Unauthorized Admin", 400, {});
    }

    let {
      topic = "NOTIFICATION_ALL",
      title = "Testing",
      body = "Please Ignore this notification.",
      clickActionUrl = "notification",
      imageUrl = "",
    } = req.body;

    await sendToTopic(
      (topic),
      (title),
      (body),
      (clickActionUrl = "notification"),
      (imageUrl)
    );

    const newNotification = new Notification({
      topic,
      title,
      body,
      clickActionUrl,
      imageUrl,
      status : "Active"
    });

    await newNotification.save();

    return ResponseHandler.success(
      res,
      "Notification sent successfully",
      200,
      {}
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 500, {});
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const token = req.token;

    const user = await User.findOne({ _id: token._id, status: "Active" });
    const admin = await Admin.findOne({ _id: token._id });

    if (!(user || admin)) {
      return ResponseHandler.failed(res, "Unauthorized Access", 400, {});
    }

    let { page = 1, limit = 10 } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;

    const query = {
      status: "Active",
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRecords = await Notification.countDocuments(query);

    const result = {
      data: notifications,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };

    return ResponseHandler.success(
      res,
      "Notification fetched successfully",
      200,
      result
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 500, {});
  }
};