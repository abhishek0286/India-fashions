const express = require("express");
const homeSectionRouter = express.Router();
const homeSectionController = require("../controller/homeSectionController");
const { decodeToken } = require("../../../middlewares/verifyJWT");
const upload = require('../../../middlewares/multer');

// Admin actions
homeSectionRouter.post(
  "/add",
  decodeToken,
  upload.single("bannerImage"),
  homeSectionController.createSection
);
homeSectionRouter.post(
  "/update/:id",
  decodeToken,
  upload.single("bannerImage"),
  homeSectionController.updateSection
);
homeSectionRouter.post(
  "/delete/:id",
  decodeToken,
  upload.none(),
  homeSectionController.deleteSection
);

// Public
homeSectionRouter.get(
  "/get-home-sections",
  decodeToken,
  upload.none(),
  homeSectionController.getHomeSections
);

homeSectionRouter.get(
  "/homepage-data",
  decodeToken, // custom middleware: sets req.user if token present, else continues
  upload.none(),
  homeSectionController.getHomepage
);

module.exports = homeSectionRouter;
