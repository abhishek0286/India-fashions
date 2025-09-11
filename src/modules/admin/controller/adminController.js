const Admin = require("../model/adminModel");
const User = require("../../user/model/userModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { generateAuthJWT } = require("../../../middlewares/verifyJWT");

// Methods

const isValidEmail = (email) => {
  return validator.isEmail(email);
};

const isValidPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    requiredLength: 8,
    uppercase: 1,
    lowercase: 1,
    numbers: 1,
    specialChars: 1,
  });
};

// Controllers
// ----------------------------------------------------------------

// Admin Essentials

exports.adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.toLowerCase()?.trim();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email is required",
        result: {},
      });
    }

    if (!isValidEmail(email)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid email format",
        result: {},
      });
    }

    if (!password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password is required",
        result: {},
      });
    }

    if (!isValidPassword(password)) {
      return res.send({
        statusCode: 400,
        success: false,
        message:
          "Invalid password format. Password should be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        result: {},
      });
    }

    let admin = await Admin.findOne({ email });

    if (!admin) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid credentials",
        result: {},
      });
    }

    let isPasswordMatch = await bcrypt.compare(password, admin.password);

    console.log(isPasswordMatch, admin.password, password);

    if (!isPasswordMatch) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Incorrect password",
        result: {},
      });
    }

    const token = generateAuthJWT({
      _id: admin._id,
      email: admin.email,
      expires_in: process.env.JWT_EXPIRES_IN,
    });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Logged in successfully",
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

exports.changePassword = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: token._id });

    if (admin) {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.send({
          statusCode: 400,
          success: false,
          message:
            "Old password, new password and confirmPassword are required.",
          result: {},
        });
      }

      if (newPassword !== confirmPassword) {
        return res.send({
          statusCode: 400,
          success: false,
          message: "Passwords do not match.",
          result: {},
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, admin.password);

      if (!isMatch) {
        return res.send({
          statusCode: 400,
          success: false,
          message: "Old password is incorrect.",
          result: {},
        });
      }

      const isUniquePassword = await bcrypt.compare(
        newPassword,
        admin.password
      );

      if (isUniquePassword) {
        return res.send({
          statusCode: 400,
          success: false,
          message: "New password cannot be same as existing password.",
          result: {},
        });
      }

      admin.password = await bcrypt.hash(
        newPassword,
        Number.parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );

      const savedAdmin = await admin.save();

      if (savedAdmin) {
        return res.send({
          statusCode: 200,
          success: true,
          message: "Password changed successfully.",
          result: {},
        });
      } else {
        return res.send({
          statusCode: 500,
          success: false,
          message: "Failed to change password.",
          result: {},
        });
      }
    } else {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized Admin.",
        result: {},
      });
    }
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

// User Section

exports.getUsersByStatus = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: token._id });

    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized Admin.",
        result: {},
      });
    }

    let { page = 1, limit = 10, status, search, sort, sortOrder } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let skip = (page - 1) * limit;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    sort = sort || "createdAt";
    sortOrder = sortOrder === "desc" ? -1 : 1;

    const users = await User.find(query)
      .sort({
        [sort]: sortOrder,
      })
      .skip(skip)
      .limit(limit)
      .select("-password -otp -resetPasswordEntry")
      .lean();

    const totalRecords = await User.countDocuments(query);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Active Users fetched successfully.",
      result: {
        users,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
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

exports.getUserById = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: token._id });

    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized Admin.",
        result: {},
      });
    }

    const { userId } = req.params;

    if (!userId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "User ID is required.",
        result: {},
      });
    }

    const user = await User.findOne({ _id: userId })
      .select("-password -otp -resetPasswordEntry")
      .lean();

    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "User not found.",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "User fetched successfully.",
      result: user,
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

exports.updateUserStatus = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: token._id });

    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized Admin.",
        result: {},
      });
    }

    const { userId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "User ID is required.",
        result: {},
      });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "User not found.",
        result: {},
      });
    }

    user.status = status;

    const updatedUser = await user.save();

    if (updatedUser) {
      return res.send({
        statusCode: 200,
        success: true,
        message: "User status updated successfully.",
        result: {},
      });
    } else {
      return res.send({
        statusCode: 500,
        success: false,
        message: "Failed to update user status.",
        result: {},
      });
    }
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
