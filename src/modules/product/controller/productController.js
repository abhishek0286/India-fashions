const Product = require("../model/productModel");
const Variant = require("../../variant/model/variantModel");
const Review = require("../../review/model/reviewModel");
const Wishlist = require("../../wishlist/model/wishlistModel");
const mongoose = require("mongoose");

// Create product
exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      slug,
      description,
      categoryId,
      attributes = JSON.stringify({}),
    } = req.body;

    if (!name || !slug || !categoryId) {
      return res.send({
        success: false,
        message: "name, slug and categoryId are required",
        statusCode: 400,
        result: {},
      });
    }
    if (!attributes) {
      return res.send({
        success: false,
        message: "Attributes are required",
        statusCode: 400,
        result: {},
      });
    }

    const exists = await Product.findOne({ slug });
    if (exists) {
      return res.send({
        success: false,
        message: "Product with this slug already exists",
        statusCode: 400,
        result: {},
      });
    }

    // Extract images from req.files
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
      // or file.filename, or upload to cloud and store URL
    }

    if (attributes) {
      console.log("attributes", attributes);
      attributes = JSON.parse(attributes);
    }

    const product = await Product.create({
      name,
      slug,
      description: description || "",
      categoryId,
      images: Array.isArray(images) ? images : [],
      attributes: attributes || {},
    });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Product created",
      result: { product },
    });
  } catch (error) {
    console.log("error", error);
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Get product by id with variants & review summary
exports.getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.send({
        success: false,
        message: "productId is required",
        error: "Missing productId",
        result: {},
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "Active",
    }).lean();
    if (!product) {
      return res.send({
        success: false,
        message: "Product not found",
        error: "Not found",
        result: {},
      });
    }

    const variants = await Variant.find({ productId, status: "Active" }).lean();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Product fetched",
      result: { product, variants },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      error: error.message,
      result: {},
    });
  }
};

// List products by category (optional)
exports.getProducts = async (req, res) => {
  try {
    const userId = req.token?._id; // optional if not logged in
    const { categoryId, search = "", page = 1, limit = 10 } = req.query;

    const filter = { status: "Active" };
    if (categoryId) filter.categoryId = categoryId;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1️⃣ Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    // 2️⃣ Get paginated products
    let products = await Product.find(filter)
      .select("name images description price originalPrice createdAt")
      .populate({
        path: "categoryId",
        select: "-createdAt -__v -updatedAt",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 3️⃣ Add wishlist status if user logged in
    console.log("userId && products.length > 0", userId, products.length > 0);
    if (userId && products.length > 0) {
      const wishlist = await Wishlist.findOne({ user: userId })
        .select("items.product")
        .lean();
      const wishlistProductIds = new Set(
        wishlist?.items.map((item) => item.product.toString()) || []
      );

      console.log("Wihslist products", wishlist, wishlistProductIds);

      products = products.map((product) => ({
        ...product,
        isWishlisted: wishlistProductIds.has(product._id.toString()),
      }));
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Products fetched successfully",
      result: {
        data: products,
        total: totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Server error",
      result: {},
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const payload = req.body;
    const { productId } = req.params;
    if (!productId) {
      return res.send({
        success: false,
        message: "productId is required",
        error: "Missing productId",
        result: {},
      });
    }

    const allowed = [
      "name",
      "slug",
      "description",
      "categoryId",
      "images",
      "attributes",
      "status",
    ];
    const update = {};
    allowed.forEach((k) => {
      if (typeof payload[k] !== "undefined") update[k] = payload[k];
    });

    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.send({
        success: false,
        message: "Product not found",
        error: "Not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Product updated",
      result: { product: updated },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      error: error.message,
      result: {},
    });
  }
};

// Delete (soft)
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.send({
        success: false,
        message: "productId is required",
        error: "Missing productId",
        result: {},
      });
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: { status: "Delete" } },
      { new: true }
    );

    if (!updated) {
      return res.send({
        success: false,
        message: "Product not found",
        error: "Not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Product deleted",
      result: { product: updated },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      error: error.message,
      result: {},
    });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.token?._id || null;
    const { page = 1, limit = 5 } = req.query; // reviews pagination

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid product ID",
        result: {},
      });
    }

    // 1️⃣ Fetch Product with category & variants
    const product = await Product.findOne({ _id: productId, status: "Active" })
      .populate("category", "name slug")
      .populate("variants.color")
      .populate("variants.size")
      .lean();

    if (!product) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Product not found",
        result: {},
      });
    }

    // 2️⃣ Wishlist status
    let isWishlisted = false;
    if (userId) {
      isWishlisted = await Wishlist.exists({
        user: userId,
        product: productId,
      });
    }

    // 3️⃣ Reviews
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ product: productId, status: "Active" })
      .populate("user", "fullName profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments({
      product: productId,
      status: "Active",
    });

    const avgRating =
      totalReviews > 0
        ? (
            await Review.aggregate([
              {
                $match: {
                  product: new mongoose.Types.ObjectId(productId),
                  status: "Active",
                },
              },
              { $group: { _id: null, avg: { $avg: "$rating" } } },
            ])
          )[0]?.avg || 0
        : 0;

    // 4️⃣ Final Response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Product details fetched successfully",
      result: {
        ...product,
        isWishlisted,
        averageRating: avgRating.toFixed(1),
        totalReviews,
        reviews: {
          data: reviews,
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Server error",
      result: {},
    });
  }
};
