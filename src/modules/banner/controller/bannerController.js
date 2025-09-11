const Banner = require("../model/bannerModel");
const Product = require('../../product/model/productModel');

exports.createBanner = async (req, res) => {
  try {
    const { title, category, redirectType, redirectValue, displayOrder } = req.body;

    const image = req?.file?.path || "";

    const banner = new Banner({
      title,
      image,
      category,
      redirectType,
      redirectValue,
      displayOrder
    });

    await banner.save();

    res.send({
      statusCode: 200,
      success: true,
      message: "Banner created successfully",
      result: banner
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { title, category, redirectType, redirectValue, displayOrder } = req.body;

    // If new image uploaded, replace it
    const image = req?.file?.path;

    const updateData = {
      ...(title && { title }),
      ...(category && { category }),
      ...(redirectType && { redirectType }),
      ...(redirectValue && { redirectValue }),
      ...(displayOrder && { displayOrder }),
      ...(image && { image }),
    };

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedBanner) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Banner not found",
        result: {},
      });
    }

    res.send({
      statusCode: 200,
      success: true,
      message: "Banner updated successfully",
      result: updatedBanner,
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

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(req.params.id, { status: "Deleted" });
    res.send({
      statusCode: 200,
      success: true,
      message: "Banner deleted successfully",
      result: {}
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ status: "Active" })
      .sort({ displayOrder: 1 })
      .populate("category", "name slug _id");

    res.send({
      statusCode: 200,
      success: true,
      message: "Banners fetched successfully",
      result: banners
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

exports.getBannerProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const banner = await Banner.findById(id)
      .populate("category", "name slug _id");

    if (!banner || banner.status !== "Active") {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Banner not found or inactive",
        result: {}
      });
    }

    const products = await Product.find({
      categoryId: banner.category._id,
      status: "Active"
    })
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug _id");

    const total = await Product.countDocuments({
      category: banner.category._id,
      status: "Active"
    });

    res.send({
      statusCode: 200,
      success: true,
      message: "Banner products fetched successfully",
      result: {
        banner,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};