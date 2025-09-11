const Product = require("../model/productModel");

exports.getAvailableFilters = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const matchStage = categoryId ? { category: categoryId } : {};

    const products = await Product.aggregate([
      { $match: matchStage },
      { $unwind: "$variants" },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$variants.discountPrice" },
          maxPrice: { $max: "$variants.discountPrice" },
          sizes: { $addToSet: "$variants.size" },
          colors: { $addToSet: "$variants.color" }
        }
      }
    ]);

    if (!products.length) {
      return res.send({
        statusCode: 200,
        success: true,
        message: "No filters available",
        result: {}
      });
    }

    const { minPrice, maxPrice, sizes, colors } = products[0];

    res.send({
      statusCode: 200,
      success: true,
      message: "Available filters fetched successfully",
      result: {
        price: { min: minPrice, max: maxPrice },
        rating: [1, 2, 3, 4, 5],
        sizes: sizes.filter(Boolean),
        colors: colors.filter(Boolean)
      }
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      error: error.message,
      result: {}
    });
  }
};

exports.filterProducts = async (req, res) => {
  try {
    const { categoryId, filters, page = 1, limit = 10 } = req.body;

    let query = {};
    if (categoryId) query.category = categoryId;

    if (filters?.rating?.length) {
      query.averageRating = { $in: filters.rating };
    }

    let variantConditions = [];
    if (filters?.sizes?.length) {
      variantConditions.push({ "variants.size": { $in: filters.sizes } });
    }
    if (filters?.colors?.length) {
      variantConditions.push({ "variants.color": { $in: filters.colors } });
    }
    if (filters?.price) {
      variantConditions.push({
        "variants.discountPrice": {
          $gte: filters.price.min,
          $lte: filters.price.max
        }
      });
    }

    if (variantConditions.length) {
      query.$and = variantConditions;
    }

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    res.send({
      statusCode: 200,
      success: true,
      message: "Filtered products fetched successfully",
      result: {
        products,
        pagination: { page, limit, total }
      }
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message || "Server error",
      error: error.message,
      result: {}
    });
  }
};
