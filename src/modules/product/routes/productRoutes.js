const express = require("express");
const productRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const productController = require("../controller/productController");

productRouter.post("/create", verifyJWT.decodeToken, upload.array('images', 10), productController.createProduct);
productRouter.get("/get/:productId",verifyJWT.decodeToken, productController.getProduct);          // ?productId=...
productRouter.get("/list",verifyJWT.decodeToken, productController.getProducts);          // optional ?categoryId=...
productRouter.post("/update/:productId", verifyJWT.decodeToken, upload.none(), productController.updateProduct);
productRouter.post("/delete/:productId", verifyJWT.decodeToken, upload.none(), productController.deleteProduct);

productRouter.get("/:productId",verifyJWT.decodeToken,productController.getProductDetail);


module.exports = productRouter;
