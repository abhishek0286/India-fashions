const express = require("express")

const policyRouter = express.Router();
const privacyController = require('../controller/policyController')
const verifyJWT = require('../../../middlewares/verifyJWT');
const upload = require('../../../middlewares/multer')

policyRouter.post("/create-privacy-policy",verifyJWT.decodeToken ,upload.none(),privacyController.createPrivacyPolicy);
policyRouter.get("/get-privacy-policy",upload.none(),privacyController.getPrivacyPolicy);

module.exports = policyRouter