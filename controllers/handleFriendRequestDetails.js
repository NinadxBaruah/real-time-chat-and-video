const FriendRequest = require("../db/FriendRequest");
const User = require("../db/userModel");

const handleFriendRequestDetails = async (req, res) => {
  const user_id = req.user;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const friendRequests = (
      await FriendRequest.find({ recipient: user_id })
    ).filter((item) => item.status != "accept");

    if (friendRequests.length > 0) {
      const senders = await User.find({
        _id: { $in: friendRequests.map((request) => request.sender) },
      });

      const senderInfos = senders.map((sender) => {
        return {
          id: sender._id,
          name: sender.name,
          image: sender.picture,
        };
      });

      // If we have friend requests, return 200 and stop further execution
      return res.status(200).json({ message: "success", senderInfos });
    }

    // If no friend requests were found, return 404
    return res.status(404).json({ message: "No friend requests found" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = handleFriendRequestDetails;
