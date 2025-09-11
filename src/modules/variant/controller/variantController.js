const Variant = require("../model/variantModel");

// Add variant
exports.addVariant = async (req, res) => {
  try {
    const { productId, sku, color, size, originalPrice, discountPrice, stock } = req.body;

    if (!productId || !sku || typeof originalPrice === "undefined" || typeof discountPrice === "undefined") {
      return res.send({
        success: false,
        message: "productId, sku, originalPrice, discountPrice are required",
        error: "Missing fields",
        result: {},
      });
    }

    const v = await Variant.create({
      productId,
      sku,
      color: color || "",
      size: size || "",
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      stock: Number(stock || 0),
    });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Variant added",
      result: { variant: v },
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

// Update variant
exports.updateVariant = async (req, res) => {
  try {
    const { variantId, ...payload } = req.body;
    if (!variantId) {
      return res.send({
        success: false,
        message: "variantId is required",
        error: "Missing variantId",
        result: {},
      });
    }

    const fields = ["sku", "color", "size", "originalPrice", "discountPrice", "stock", "status"];
    const update = {};
    fields.forEach((k) => {
      if (typeof payload[k] !== "undefined") update[k] = payload[k];
    });

    const updated = await Variant.findByIdAndUpdate(variantId, { $set: update }, { new: true });

    if (!updated) {
      return res.send({
        success: false,
        message: "Variant not found",
        error: "Not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Variant updated",
      result: { variant: updated },
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
exports.deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.body;
    if (!variantId) {
      return res.send({
        success: false,
        message: "variantId is required",
        error: "Missing variantId",
        result: {},
      });
    }

    const updated = await Variant.findByIdAndUpdate(variantId, { $set: { status: "Delete" } }, { new: true });

    if (!updated) {
      return res.send({
        success: false,
        message: "Variant not found",
        error: "Not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Variant deleted",
      result: { variant: updated },
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

// List variants for a product
exports.listVariants = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.send({
        success: false,
        message: "productId is required",
        error: "Missing productId",
        result: {},
      });
    }

    const variants = await Variant.find({ productId, status: "Active" }).sort({ createdAt: -1 });
    return res.send({
      statusCode: 200,
      success: true,
      message: "Variants fetched",
      result: { variants },
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
