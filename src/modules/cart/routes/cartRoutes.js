const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controller/cartController");
const verifyJWT = require('../../../middlewares/verifyJWT');
const upload = require("../../../middlewares/multer");

cartRouter.post("/add", verifyJWT.decodeToken,upload.none(), cartController.addItems);
cartRouter.post("/remove", verifyJWT.decodeToken,upload.none(), cartController.removeItem);
cartRouter.get("/get-all", verifyJWT.decodeToken,upload.none(), cartController.getCart);

module.exports = cartRouter;
