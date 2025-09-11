const express = require("express");
const variantRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const variantController = require("../controller/variantController");

variantRouter.post("/add", verifyJWT.decodeToken, upload.none(), variantController.addVariant);
variantRouter.post("/update", verifyJWT.decodeToken, upload.none(), variantController.updateVariant);
variantRouter.post("/delete", verifyJWT.decodeToken, upload.none(), variantController.deleteVariant);
variantRouter.get("/list", variantController.listVariants); // ?productId=...

module.exports = variantRouter;