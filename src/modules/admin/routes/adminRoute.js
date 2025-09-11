const express = require('express');
const adminRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const adminController = require("../controller/adminController");


// Admin Section
adminRouter.post('/login', upload.none(), adminController.adminLogin);
adminRouter.post('/change-password',  verifyJWT.decodeToken,upload.none(), adminController.changePassword);

// User Section
adminRouter.get('/get-users', verifyJWT.decodeToken, upload.none(), adminController.getUsersByStatus);
adminRouter.get('/get-user-detail/:userId', verifyJWT.decodeToken, upload.none(), adminController.getUserById);
adminRouter.post('/update-user-status/:userId', upload.none(), verifyJWT.decodeToken, adminController.updateUserStatus);

// Testing
adminRouter.get("/testing", (req,res) => {
    res.status(200).json({message: "Admin Testing"});
})

module.exports = adminRouter;