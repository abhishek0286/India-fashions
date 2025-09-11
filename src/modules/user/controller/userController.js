const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const OTP = require("../model/otpModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// ===== Helpers (inline; replace with your utils if you want) =====
function isValidEmail(email) {
  // basic RFC-ish check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isDisposableEmail(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  const disposable = [
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
  ];
  return disposable.includes(domain);
}

function generateOTP() {
  // 4-digit numeric OTP, 1000–9999 (no leading zeros)
  const n = Math.floor(1000 + Math.random() * 9000);
  return String(n);
}

// Stub: integrate your real mailer here; return true on success
async function sendEmail(to, subject, text) {
  console.log(`[DEV] Email → ${to} | ${subject} | ${text}`);
  return true;
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

// Signup: Step 1 - Send OTP
exports.signup = async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase();

    // Check if already registered
    const existingUser = await User.findOne({ email, status: "Active" });
    if (existingUser) {
      return res.send({
        status: 400,
        success: false,
        message: "Email already registered",
        result: {},
      });
    }

    // // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    await OTP.deleteMany({ email });

    // // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // // Store OTP in memory with 5-min expiry
    // otpStore[email] = {
    //   otp,
    //   data: { fullName, email, password: hashedPassword },
    //   expiresAt: Date.now() + 5 * 60 * 1000,
    // };

    // Send OTP via email (implement sendEmail)
    await sendEmail(email, "Verify your OTP", `Your OTP is ${otp}`);

    const newOtp = new OTP({
      email: email,
      otpValue: otp,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
    });
    await newOtp.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP sent successfully",
      result: { email, otp },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Server error",
      result: {},
    });
  }
};

exports.verifySignupOtp = async (req, res) => {
  try {
    let { email, otp, fullName, password } = req.body;
    email = email?.toLowerCase();

    if (!email || !otp || !fullName || !password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "All fields are required",
        result: {},
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const stored = await OTP.findOne({ email });

    // Check if OTP exists in store
    if (!stored) {
      return res.send({
        
        statusCode: 404,
        success: false,
        message: "OTP expired or not found",
        result: {},
      });
    }

    // Expiry check
    if (Date.now() > stored.expiresAt) {
      await OTP.deleteMany({ email });
      return res.send({
        statusCode: 400,
        success: false,
        message: "OTP expired",
        result: {},
      });
    }

    // Match OTP
    if (stored.otpValue !== otp) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid OTP",
        result: {},
      });
    }

    // Create user in DB
    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      status: "Active",
    });
    await newUser.save();

    // Remove OTP from store
    await OTP.deleteMany({ email });

    // Generate token
    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      result: {
        token,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Login Controller
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);

    const user = await User.findOne({ email, status: "Active" });
    if (!user) {
      return res.send({
        success: false,
        message: "Invalid email or password",
        error: "Auth failed",
        result: {},
      });
    }

    console.log(user)

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid email or password",
        result: {},
      });
    }

    // Create token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.send({
      statusCode: 200,
      success: true,
      message: "Login successful",
      result: {
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePhoto: user.profilePhoto,
        },
      },
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// OTP Verification Controller
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    email = email?.toLowerCase();

    const savedOTP = await OTP.findOne({ email, otp });
    if (!savedOTP) {
      return res.send({
        success: false,
        message: "Invalid OTP",
        statusCode: 404,
        result: {},
      });
    }

    const user = await User.findOne({ email });

    // Create token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      result: {
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase();

    await OTP.deleteMany({ email });

    // New OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await sendEmail(email, "Resend OTP", `Your OTP is ${otp}`);

    const savedOtp = new OTP({
      email: email,
      otpValue: otp,
      otpExpiry: expiresAt, // expires in 5 min
    });
    await savedOtp.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP resent successfully",
      result: { email,otp },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// ===== Forgot Password: Step 1 - Request OTP =====
exports.forgotPasswordOTP = async (req, res) => {
  try {
    let { email } = req.body;
    email = (email || "").toLowerCase().trim();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email is required",
        error: "Email is required",
        result: {},
      });
    }

    if (!isValidEmail(email) || isDisposableEmail(email)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid email address.",
        error: "Invalid email",
        result: {},
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorize User.",
        error: "User not found",
        result: {},
      });
    }

    if (user.status === "Blocked") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Account is blocked. Please contact support.",
        error: "Blocked",
        result: {},
      });
    }

    if (user.status === "Inactive" || user.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Your account is deactivated",
        error: "Inactive",
        result: {},
      });
    }

    if (user.status === "Pending") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Your account is in pending. Please verify your email.",
        error: "Pending",
        result: {},
      });
    }

    await OTP.deleteMany({ email });

    // Issue new OTP (overwrites any existing one)
    const otpValue = generateOTP();
    const otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

    const savedOtp = new OTP({
      email: email,
      otpValue: otpValue,
      otpExpiry: otpExpiryTime, // expires in 5 min
    });
    await savedOtp.save();

    const isEmailSent = await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP for password reset is ${otpValue} and will expire in 5 minutes.`
    );

    if (!isEmailSent) {
      return res.send({
        statusCode: 500,
        success: false,
        message: "Failed to send OTP email. Please try again later.",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP sent successfully.",
      result: {
        otp: {
          otpValue: process.env.NODE_ENV === "development" ? otpValue : "",
          otpExpiryTime, // expose time for client countdown if you want
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      result: {},
    });
  }
};

// ===== Forgot Password: Step 2 - Verify OTP → Issue Reset Token =====
exports.verifyResetPasswordOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = (email || "").toLowerCase().trim();
    otp = (otp || "").trim();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email is required.",
        error: "Email is required",
        result: {},
      });
    }

    if (!otp) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "OTP is required.",
        error: "OTP is required",
        result: {},
      });
    }

    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "OTP must have 4 digits.",
        error: "Invalid OTP length",
        result: {},
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "User not found.",
        error: "Not found",
        result: {},
      });
    }

    if (user.status === "Blocked") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Account is blocked. Please contact support.",
        error: "Blocked",
        result: {},
      });
    }

    if (user.status === "Inactive" || user.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Your account is deactivated",
        error: "Inactive",
        result: {},
      });
    }

    if (user.status === "Pending") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Your account is in pending. Please verify your email.",
        error: "Pending",
        result: {},
      });
    }

    const storedOTP = await OTP.findOne({ email });

    if (!storedOTP) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "No OTP found. Please request a new OTP.",
        error: "No OTP",
        result: {},
      });
    }

    if (storedOTP.otpValue !== otp) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid OTP.",
        error: "Invalid OTP",
        result: {},
      });
    }

    if (Date.now() > Number(storedOTP.otpExpiry)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "OTP has expired. Please request a new one.",
        error: "OTP expired",
        result: {},
      });
    }

    await OTP.deleteMany({ email });

    // Issue reset token valid for 15 minutes
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordEntry.resetPasswordToken = token;
    user.resetPasswordEntry.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    const savedUser = await user.save();
    if (!savedUser) {
      return res.send({
        statusCode: 500,
        success: false,
        message: "Failed to verify account.",
        error: "Save failed",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP verified successfully.",
      result: { token },
    });
  } catch (error) {
    console.error(error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      result: {},
    });
  }
};

// ===== Forgot Password: Step 3 - Reset Password with Token =====
exports.resetPassword = async (req, res) => {
  try {
    let { token, newPassword, confirmPassword } = req.body;
    token = (token || "").trim();
    newPassword = (newPassword || "").trim();
    confirmPassword = (confirmPassword || "").trim();

    if (!newPassword || !confirmPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "New password and confirmPassword are required.",
        error: "Missing fields",
        result: {},
      });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Passwords do not match.",
        error: "Mismatch",
        result: {},
      });
    }

    if (newPassword.length < 8) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password must be at least 8 characters.",
        error: "Weak password",
        result: {},
      });
    }

    if (!token) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Reset Password Token is required.",
        error: "Missing token",
        result: {},
      });
    }

    const user = await User.findOne({
      "resetPasswordEntry.resetPasswordToken": token,
      "resetPasswordEntry.resetPasswordExpires": { $gt: Date.now() },
    });

    if (!user) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invaild Token or Time limit exceed. Please Try again",
        error: "Invalid/expired token",
        result: {},
      });
    }

    if (user.status === "Blocked") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Account is blocked. Please contact support.",
        error: "Blocked",
        result: {},
      });
    }

    if (user.status === "Inactive" || user.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Your account is deactivated",
        error: "Inactive",
        result: {},
      });
    }

    if (user.status === "Pending") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Your account is in pending. Please verify your email.",
        error: "Pending",
        result: {},
      });
    }

    // prevent reusing same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "New password cannot be same as existing password.",
        error: "Same password",
        result: {},
      });
    }

    const rounds =
      Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10") || 10;
    user.password = await bcrypt.hash(newPassword, rounds);

    // Invalidate reset token after success
    user.resetPasswordEntry.resetPasswordToken = "";
    user.resetPasswordEntry.resetPasswordExpires = 0;

    const savedUser = await user.save();
    if (!savedUser) {
      return res.send({
        statusCode: 500,
        success: false,
        message: "Failed to reset password.",
        error: "Save failed",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Password reset successfully.",
      result: {},
    });
  } catch (error) {
    console.error(error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error",
      result: {},
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.token?._id; // from verifyJWT.decodeToken
    const { fullName, dob } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (dob) updateData.dob = dob;
    if (req.file && req.file.path) {
      updateData.profilePhoto = req.file.path; // In prod, store cloud URL
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password -resetPasswordEntry -__v");

    if (!updatedUser) {
      return res.send({
        success: false,
        message: "User not found",
        error: "Invalid user",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      result: {},
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.token?._id; // from verifyJWT.decodeToken

    const user = await User.findById(userId).select(
      "-password -resetPasswordEntry"
    );

    if (!user) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "User not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      result: user,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Add Address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.token?._id;
    const { addressType, street, city, state, country } = req.body;

    if (!addressType || !street || !city || !state || !country) {
      return res.send({
        success: false,
        message: "All address fields are required",
        statusCode: 400,
        result: {},
      });
    }

    // Find the user first
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return res.send({
        success: false,
        message: "User not found",
        result: {},
      });
    }

    // Check if the exact same address already exists
    const existingAddress = user.addresses.find(
      (addr) =>
        addr.addressType === addressType &&
        addr.street === street &&
        addr.city === city &&
        addr.state === state &&
        addr.country === country
    );

    if (existingAddress) {
      return res.send({
        success: false,
        message: "This address already exists",
        error: "Duplicate address",
        result: {},
      });
    }

    // Add new address
    user.addresses.push({ addressType, street, city, state, country });
    await user.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Address added successfully",
      result: user.addresses,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.token?._id;
    const { addressId, addressType, street, city, state, country } = req.body;

    if (!addressId) {
      return res.send({
        success: false,
        message: "Address ID is required",
        error: "Missing ID",
        result: {},
      });
    }

    // Find the user first
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return res.send({
        success: false,
        message: "User not found",
        result: {},
      });
    }

    const addressToUpdate = user.addresses.id(addressId);
    if (!addressToUpdate) {
      return res.send({
        success: false,
        message: "Address not found",
        error: "Invalid ID",
        result: {},
      });
    }

    // Check if another address already has the same values
    const duplicateAddress = user.addresses.find(
      (addr) =>
        addr._id.toString() !== addressId &&
        addr.addressType === addressType &&
        addr.street === street &&
        addr.city === city &&
        addr.state === state &&
        addr.country === country
    );

    if (duplicateAddress) {
      return res.send({
        success: false,
        message: "Another address with these details already exists",
        error: "Duplicate address",
        result: {},
      });
    }

    // Update address
    addressToUpdate.addressType = addressType;
    addressToUpdate.street = street;
    addressToUpdate.city = city;
    addressToUpdate.state = state;
    addressToUpdate.country = country;

    await user.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Address updated successfully",
      result: user.addresses,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.token?._id;
    const { addressId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.send({
        success: false,
        message: "Address not found or already deleted",
        error: "Invalid ID",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Address deleted successfully",
      result: updatedUser.addresses,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Add Payment Method
exports.addPaymentMethod = async (req, res) => {
  try {
    const userId = req.token?._id;
    const { cardType, cardNumber, expiry } = req.body;

    if (!cardType || !cardNumber || !expiry) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "All payment fields are required",
        result: {},
      });
    }

    // Find the user first
    const user = await User.findById(userId).select("paymentMethods");
    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "User not found",
        result: {},
      });
    }

    // Check if cardNumber already exists
    const existingCard = user.paymentMethods.find(
      (method) => method.cardNumber === cardNumber
    );

    if (existingCard) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Payment method with this card number already exists",
        result: {},
      });
    }

    // Add the new payment method
    user.paymentMethods.push({ cardType, cardNumber, expiry });
    await user.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Payment method added successfully",
      result: user.paymentMethods,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Update Payment Method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const userId = req.token?._id;
    const { paymentId, cardType, cardNumber, expiry } = req.body;

    if (!paymentId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Payment ID is required",
        result: {},
      });
    }

    // Find the user first
    const user = await User.findById(userId).select("paymentMethods");
    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "User not found",
        result: {},
      });
    }

    // Check if the payment method exists
    const paymentMethod = user.paymentMethods.id(paymentId);
    if (!paymentMethod) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Payment method not found",
        result: {},
      });
    }

    // Check if the new cardNumber already exists on a different payment method
    const duplicateCard = user.paymentMethods.find(
      (method) =>
        method.cardNumber === cardNumber && method._id.toString() !== paymentId
    );

    if (duplicateCard) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Another payment method with this card number already exists",
        result: {},
      });
    }

    // Update the payment method
    paymentMethod.cardType = cardType;
    paymentMethod.cardNumber = cardNumber;
    paymentMethod.expiry = expiry;

    await user.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Payment method updated successfully",
      result: user.paymentMethods,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Delete Payment Method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.token?._id;
    const { paymentId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { paymentMethods: { _id: paymentId } } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.send({
        success: false,
        message: "Payment method not found or already deleted",
        error: "Invalid ID",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Payment method deleted successfully",
      result: updatedUser.paymentMethods,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};
