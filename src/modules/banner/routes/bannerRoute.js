const express = require("express");
const bannerRouter = express.Router();
const bannerController = require("../controller/bannerController");
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require('../../../middlewares/multer');

// Admin routes
bannerRouter.post("/add", verifyJWT.decodeToken,upload.single("image"), bannerController.createBanner);
bannerRouter.post("/update/:id", verifyJWT.decodeToken,upload.single("image"), bannerController.updateBanner);
bannerRouter.post("/delete/:id", verifyJWT.decodeToken,upload.none(), bannerController.deleteBanner);

// Public route
bannerRouter.get("/get-all-banners",verifyJWT.decodeToken, upload.none(), bannerController.getBanners);
bannerRouter.get("/products/:id",verifyJWT.decodeToken,upload.none(), bannerController.getBannerProducts);

module.exports = bannerRouter;
