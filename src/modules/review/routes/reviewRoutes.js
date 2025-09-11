const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middlewares/verifyJWT");
const upload = require("../../../middlewares/multer");
const reviewController = require("../controller/reviewController");

// Add Review (with optional images)
router.post(
  "/add/:productId",
  verifyJWT.decodeToken,
  upload.array("images", 5), // max 5 images
  reviewController.addReview
);

// Get all reviews for a product
router.get(
  "/product/:productId",
  verifyJWT.decodeToken,
  upload.none(),
  reviewController.getProductReviews
);

// Update Review (with optional images)
router.post(
  "/update/:reviewId",
  verifyJWT.decodeToken,
  upload.array("images", 5),
  reviewController.updateReview
);

// Delete Review
router.post(
  "/delete/:reviewId",
  verifyJWT.decodeToken,
  upload.none(),
  reviewController.deleteReview
);

module.exports = router;
