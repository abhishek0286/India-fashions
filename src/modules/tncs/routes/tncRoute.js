const express = require("express")

const termRouter = express.Router();
const termController = require('../controller/tncController')
const verifyJWT = require('../../../middlewares/verifyJWT');
const upload = require('../../../middlewares/multer')

termRouter.post("/create-terms",verifyJWT.decodeToken ,upload.none(),termController.createTermsAndConditions);
termRouter.get("/get-terms",upload.none(),termController.getTermsAndConditions);

module.exports = termRouter