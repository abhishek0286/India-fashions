const HomeSection = require("../model/homeSectionModel");
const Banner = require("../../banner/model/bannerModel");
const Category = require("../../productCategory/model/categoryModel");
const Wishlist = require("../../wishlist/model/wishlistModel");
const Variant = require("../../variant/model/variantModel");

exports.createSection = async (req, res) => {
  try {
    let { sectionType, title, products, displayOrder } = req.body;

    let bannerImage = "";
    if (req.file) {
      bannerImage = req.file.path;
    }

    if (products) {
      products = JSON.parse(products);
    }

    const section = new HomeSection({
      sectionType,
      title,
      products,
      displayOrder,
      bannerImage,
    });

    await section.save();

    res.send({
      statusCode: 200,
      success: true,
      message: "Section created successfully",
      result: section,
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const updateData = req.body;

    if (req.file) {
      updateData.bannerImage = req.file.path;
    }

    const updatedSection = await HomeSection.findByIdAndUpdate(
      sectionId,
      updateData,
      { new: true }
    );

    res.send({
      statusCode: 200,
      success: true,
      message: "Section updated successfully",
      result: updatedSection,
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.id;

    await HomeSection.findByIdAndUpdate(sectionId, { status: "Deleted" });

    res.send({
      statusCode: 200,
      success: true,
      message: "Section deleted successfully",
      result: {},
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

exports.getHomeSections = async (req, res) => {
  try {
    // Read page & limit from query params, default to page=1, limit=10
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Calculate skip value
    let skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalSections = await HomeSection.countDocuments({
      status: "Active",
    });

    const sections = await HomeSection.find({ status: "Active" })
      .sort({ displayOrder: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "products",
        select: "name images originalPrice discountPrice rating",
      })
      .lean();

    res.send({
      statusCode: 200,
      success: true,
      message: "Home sections fetched successfully",
      result: {
        data: sections,
        totalRecords: totalSections,
        currentPage: page,
        totalPages: Math.ceil(totalSections / limit),
      },
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

exports.getHomepage = async (req, res) => {
  try {
    const userId = req.token?._id || null;

    // 1️⃣ Get banners
    const banners = await Banner.find({ status: "Active" })
      .sort({ displayOrder: 1 })
      .lean();

    // 2️⃣ Get trending categories (limit 4)
    const trendingCategories = await Category.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // 3️⃣ Get sections (Kids Looks, New Arrivals, etc.)
    const sections = await HomeSection.find({ status: "Active" })
      .sort({ displayOrder: 1 })
      .populate({
        path: "products",
        match: { status: "Active" },
        select: "name images averageRating totalReviews",
      })
      .lean();

    // 4️⃣ If user logged in, fetch wishlist product IDs
    let wishlistProductIds = [];
    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId }).lean();
      wishlistProductIds = wishlist?.items?.map((i) => String(i.product)) || [];
    }

    // 5️⃣ Enrich products with price & wishlist status
    for (let section of sections) {
      if (!section.products) continue;
      for (let product of section.products) {
        // Get lowest discount price from variants
        const variant = await Variant.findOne({ productId: product._id })
          .sort({ discountPrice: 1 })
          .lean();
        product.price = variant ? variant.discountPrice : null;
        product.variantId = variant ? variant._id : null;

        // Wishlist flag
        product.wishlisted = wishlistProductIds.includes(String(product._id));
      }
    }
console.log("ssection",sections);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Homepage data fetched successfully",
      result: {
        banners,
        trendingCategories,
        sections: sections,
      },
    });
  } catch (error) {
    console.error("Error in getHomepage:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
