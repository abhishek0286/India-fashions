const Order = require("../model/orderModel");

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.token._id; // from verifyJWT
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user: userId };
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .select("orderId status totalAmount createdAt items")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format response
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      status: order.status,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
      createdAt: order.createdAt,
    }));

    return res.send({
      statusCode: 200,
      success: true,
      message: "Orders fetched successfully",
      result: {
        data: formattedOrders,
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalRecords: totalOrders,
        currentPage: parseInt(page),
      },
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

exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.token._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: "items.product",
        select: "name images price originalPrice",
      })
      .populate({
        path: "items.variant",
        select: "color size price originalPrice",
      })
      .lean();

    if (!order) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Order not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Order detail fetched successfully",
      result: order,
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

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.token._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Order not found",
        result: {},
      });
    }

    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: `Order cannot be cancelled once ${order.status}`,
        result: {},
      });
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Order cancelled successfully",
      result: order,
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

exports.returnOrder = async (req, res) => {
  try {
    const userId = req.token._id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Order not found",
        result: {},
      });
    }

    if (order.status !== "Delivered") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Only delivered orders can be returned",
        result: {},
      });
    }

    order.status = "Returned";
    order.returnReason = reason || "No reason provided";
    order.returnedAt = new Date();
    await order.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Order returned successfully",
      result: order,
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
