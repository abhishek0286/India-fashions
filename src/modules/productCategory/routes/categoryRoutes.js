const express = require("express");
const categoryRouter = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const categoryController = require("../controller/categoryController");

categoryRouter.post("/create", verifyJWT.decodeToken, upload.single("image"), categoryController.createCategory);
categoryRouter.get("/list", categoryController.getCategories);
categoryRouter.post("/update", verifyJWT.decodeToken, upload.single("image"), categoryController.updateCategory);
categoryRouter.post("/delete/:categoryId", verifyJWT.decodeToken, upload.none(), categoryController.deleteCategory);

module.exports = categoryRouter;
