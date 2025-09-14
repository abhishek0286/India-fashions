const Category = require("../model/categoryModel");

// Create
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    const image = req.file.path;

    if (!name || !slug) {
      return res.send({
        success: false,
        message: "name and slug are required",
        statusCode: 400,
        result: {},
      });
    }

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.send({
        success: false,
        message: "Category with this slug already exists",
        statusCode: 400,
        result: {},
      });
    }

    const createCategory = new Category({
      name,
      slug,
      image
    })
    await createCategory.save()
    return res.send({
      statusCode: 200,
      success: true,
      message: "Category created",
      result: { },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// List (active only)
exports.getCategories = async (req, res) => {
  try {
    // Get pagination parameters from query, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Fetch paginated categories
    const [list, total] = await Promise.all([
      Category.find({ status: "Active" })
        .sort({ name: 1 })
        .select("-__v -updatedAt")
        .skip(skip)
        .limit(limit),
      Category.countDocuments({ status: "Active" }),
    ]);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Categories fetched",
      result: {
        data: list,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Update
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId, name, slug } = req.body;
    

    if (!categoryId) {
      return res.send({
        success: false,
        message: "categoryId is required",
        statusCode: 400,
        result: {},
      });
    }

    const update = {};
    if (name) update.name = name;
    if(req.file){
      update.image = req.file.path;
    }
    if (slug) update.slug = slug;

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.send({
        success: false,
        message: "Category not found",
        statusCode: 404,
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Category updated",
      result: { category: updated },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};

// Delete (soft)
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.send({
        success: false,
        message: "categoryId is required",
        statusCode: 400,
        result: {},
      });
    }

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { status: "Delete" } },
      { new: true }
    );

    if (!updated) {
      return res.send({
        success: false,
        message: "Category not found",
        statusCode: 400,
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Category deleted",
      result: { category: updated },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message || "Server error",
      statusCode: 500,
      result: {},
    });
  }
};
