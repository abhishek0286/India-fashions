const Policy = require("./../model/policyModel");
const Admin = require("./../../admin/model/adminModel");

exports.createPrivacyPolicy = async (req, res) => {
  try {
    let token = req.token;
    let { content } = req.body;

    content = content?.trim();

    if (!content) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Content required",
        result: {},
      });
    }
    const admin = await Admin.findOne({ _id: token._id });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }
    if (admin.status === "Delete") {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Your account has been deleted",
        result: {},
      });
    }

    const policy = await Policy.findOne({});
    if (policy) {
      policy.content = content;

      await policy.save();

      return res.send({
        statusCode: 200,
        success: true,
        message: "Policy update successfully",
        result: {},
      });
    }
    const createNewPolicy = new Policy({
      content,
    });

    await createNewPolicy.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Privacy Policy created successfully",
      result: {},
    });
  } catch (error) {
    console.log("error in creating terms and conditions", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      result: {
        error: error.message,
      },
    });
  }
};

exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne().select(
      "-_id -__v -createdAt -updatedAt"
    );
    if (!policy) {
      return res.send({
        statusCode: 404,
        success: true,
        message: "Privacy Policy not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Privacy Policy fetched successfully",
      result: policy,
    });
  } catch (error) {
    console.log("Error!!", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      result: {},
    });
  }
};