const Term = require("./../model/tncModel");
const Admin = require("./../../admin/model/adminModel");

exports.createTermsAndConditions = async (req, res) => {
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

    const termsConditions = await Term.findOne({});
    if (termsConditions) {
      termsConditions.content = content;

      await termsConditions.save();

      return res.send({
        statusCode: 200,
        success: true,
        message: "Term & conditions update successfully",
        result: {},
      });
    }
    const createnewTerms = new Term({
      content,
    });

    await createnewTerms.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Term & conditions created successfully",
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

exports.getTermsAndConditions = async (req, res) => {
  try {
    const termAndConditions = await Term.findOne().select(
      "-_id -__v -createdAt -updatedAt"
    );
    if (!termAndConditions) {
      return res.send({
        statusCode: 404,
        success: true,
        message: "Terms & Conditions not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Terms & Conditions fetched successfully",
      result: termAndConditions,
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