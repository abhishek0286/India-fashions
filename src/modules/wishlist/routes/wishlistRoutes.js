const express = require("express");
const wishlistRouter = express.Router();
const wishlistController = require("../controller/wishlistController");
const verifyToken = require("../../../middlewares/verifyJWT");
const upload = require('../../../middlewares/multer')

wishlistRouter.post("/add", verifyToken.decodeToken,upload.none(), wishlistController.addToWishlist);
wishlistRouter.post("/remove", verifyToken.decodeToken,upload.none(), wishlistController.removeFromWishlist);
wishlistRouter.get("/get-all", verifyToken.decodeToken,upload.none(), wishlistController.getWishlist);

module.exports = wishlistRouter;