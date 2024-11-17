const express = require("express")
const router = express.Router();
const handleGoogleAuth = require("../../controllers/handleGoogleAuth")
const handleGoogleAuthCallback = require("../../controllers/handleGoogleAuthCallback")



router.get('/google',handleGoogleAuth);
router.get('/google/callback',handleGoogleAuthCallback);

module.exports = router;

