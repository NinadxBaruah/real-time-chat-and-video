const router = require("express").Router();
const handleUserSeach = require("../../controllers/handleUserSearch")
const handleUserProfile = require("../../controllers/handleUserProfile")
const handleUpdateUserBio = require("../../controllers/handleUpdateUserBio")
const handleFriendRequest = require("../../controllers/handleFriendRequest")
const handleFriendRequestDetails = require("../../controllers/handleFriendRequestDetails")
const handleSendMessage = require("../../controllers/handleSendMessage")
const handleGetMessages = require("../../controllers/handleGetMessages")
const handleGoogleAuth = require("../../controllers/handleGoogleAuth")
const handleGoogleAuthCallback = require("../../controllers/handleGoogleAuthCallback")
const handleSendImage = require("../../controllers/handleSendImage")

const isAuthenticate = require("../../utils/isAuthenticate")


router.get('/auth/google', handleGoogleAuth)
router.get('/auth/google/callback', handleGoogleAuthCallback)
router.get('/v1/search/user',isAuthenticate,handleUserSeach);
router.post('/v1/search/user/profile',isAuthenticate,handleUserProfile);
router.post('/v1/search/user/profile/save',isAuthenticate,handleUpdateUserBio);
router.post('/v1/search/user/send/request',isAuthenticate,handleFriendRequest);
router.post('/v1/search/user/send/message',isAuthenticate,handleSendMessage);
router.post('/v1/search/user/send/image',isAuthenticate,handleSendImage);
router.post('/v1/search/user/get/messages',isAuthenticate,handleGetMessages);
router.post('/v1/search/user/friend-requests',isAuthenticate,handleFriendRequestDetails);


module.exports = router;