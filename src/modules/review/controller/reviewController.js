const Review = require("../model/reviewModel");
const Product = require("../../product/model/productModel"); // Optional: for product existence check

// Add Review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const {productId} = req.params;
    const userId = req.token._id; // from decoded JWT

    // Optional: check product exists
    // const productExists = await Product.findById(productId);
    // if (!productExists) return res.status(404).json({ message: "Product not found" });

    const images = (req.files || []).map(file => file.path); // uploaded image paths

    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
      images
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "fullName profilePhoto")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.token._id;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    if (req.files && req.files.length > 0) {
      review.images = req.files.map(file => file.path);
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.token._id;

    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
