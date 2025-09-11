const express = require("express");
const productFilterRouter = express.Router();
const productFilterController = require("../controller/productFilterController");

// Get Available Filters
productFilterRouter.get(
  "/available-filters",
  productFilterController.getAvailableFilters
);

// Apply Filters
productFilterRouter.post(
  "/filter-products",
  productFilterController.filterProducts
);

module.exports = productFilterRouter;
