const express = require("express");
const userRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const userController = require("../controller/userController");

// ===== Auth =====
userRouter.post("/signup", upload.none(), userController.signup); // sends OTP
userRouter.post("/verify-signup-otp",upload.none(),userController.verifySignupOtp); // sends OTP
userRouter.post("/verify-otp", upload.none(), userController.verifyOtp); // verifies OTP & returns token
userRouter.post("/login", upload.none(), userController.loginUser); // returns token
userRouter.post("/resend-otp",upload.none(),userController.resendOtp);

userRouter.get("/get-profile",verifyJWT.decodeToken,upload.none(),userController.getProfile);
userRouter.post("/update-profile",verifyJWT.decodeToken,upload.single("profilePhoto"),userController.updateProfile);

userRouter.post("/add-address",upload.none(),verifyJWT.decodeToken,userController.addAddress);

userRouter.post("/update-address",verifyJWT.decodeToken,upload.none(),userController.updateAddress);
userRouter.post("/delete-address/:addressId",verifyJWT.decodeToken,upload.none(),userController.deleteAddress);

userRouter.post("/add-payment",verifyJWT.decodeToken,upload.none(),userController.addPaymentMethod);

userRouter.post("/update-payment",verifyJWT.decodeToken,upload.none(),userController.updatePaymentMethod);
userRouter.post("/delete-payment/:paymentId",verifyJWT.decodeToken,upload.none(),userController.deletePaymentMethod);

// ===== Forgot Password =====
userRouter.post("/forgot-password-otp",upload.none(),userController.forgotPasswordOTP);
userRouter.post("/verify-reset-password-otp",upload.none(),userController.verifyResetPasswordOTP);
userRouter.post("/reset-password", upload.none(), userController.resetPassword);

// Example testing route
// userRouter.get("/testing", userController.testingUser);

module.exports = userRouter;
