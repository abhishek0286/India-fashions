const express = require("express");
const orderRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const orderController = require("../controller/orderController");

orderRouter.get(
  "/my-orders",
  verifyJWT.decodeToken,
  upload.none(),
  orderController.getMyOrders
);
orderRouter.get(
  "/my-orders/:orderId",
  verifyJWT.decodeToken,
  upload.none(),
  orderController.getOrderDetail
);

orderRouter.post(
  "/cancel-order/:orderId",
  verifyJWT.decodeToken,
  upload.none(),
  orderController.cancelOrder
);

orderRouter.post(
  "/return-order/:orderId",
  verifyJWT.decodeToken,
  upload.none(),
  orderController.returnOrder
);

module.exports = orderRouter;
