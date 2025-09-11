const express = require('express');
const notificationRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const notificationController = require("../controller/notificationController");


notificationRouter.post("/send-notification-to-all", verifyJWT.decodeToken, upload.none(), notificationController.sendNotificationToAll)
notificationRouter.get("/get-user-notifications", verifyJWT.decodeToken, upload.none(), notificationController.getUserNotifications)

// Testing
notificationRouter.get("/testing", (req,res) => {
    res.status(200).json({message: "Notification Testing"});
})

module.exports = notificationRouter;