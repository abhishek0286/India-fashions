const express = require("express");
const orderRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const orderController = require("../controller/orderController");

// orderRouter.post("/place-order",verifyJWT.decodeToken,upload.none(),orderController.placeOrder);
orderRouter.post("/place-order",verifyJWT.decodeToken,upload.none(),orderController.placeMultipalOrder);
orderRouter.get("/get-my-all-orders",verifyJWT.decodeToken,upload.none(),orderController.getMyOrders);
orderRouter.get("/my-orders/:orderId",verifyJWT.decodeToken,upload.none(),orderController.getOrderDetail);
orderRouter.post("/cancel-order/:orderId",verifyJWT.decodeToken,upload.none(),orderController.cancelOrder);
orderRouter.post("/return-order/:orderId",verifyJWT.decodeToken,upload.none(),orderController.returnOrder);
orderRouter.get("/get-status/:tabId",verifyJWT.decodeToken,upload.none(),orderController.getPendingDeliveredData);

module.exports = orderRouter;
