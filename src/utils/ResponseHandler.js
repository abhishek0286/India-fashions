// utils/return ResponseHandler.js

class ResponseHandler {
  static success(res, message = "Success",statusCode = 200, result = {}) {
    return res.json({
      statusCode,
      success: true,
      message,
      result,
    });
  }

  static failed(res, message = "Something went wrong", statusCode = 400, result = {}) {
    return res.json({
      statusCode,
      success: false,
      message,
      result,
    });
  }

  static error(res, message = "Something went wrong", statusCode = 500, result = {}) {
    return res.json({
      statusCode,
      success: false,
      message,
      result,
    });
  }
}

module.exports = ResponseHandler;
