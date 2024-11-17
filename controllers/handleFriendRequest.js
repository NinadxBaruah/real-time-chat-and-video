const FriendRequest = require("../db/FriendRequest");
const Friend = require("../db/Friend");

const handleFriendRequest = async (req, res) => {
  const senderId = req.user;
  const { recipientId, type } = req.body;

  if (!senderId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!recipientId) {
    return res.status(400).json({ message: "Recipient ID is required" });
  }

  try {
    if (type == "unsend") {
      const deleteFriendRequest = await FriendRequest.findOneAndDelete({
        sender: senderId,
        recipient: recipientId,
      });
      if (!deleteFriendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      return res.status(200).json({ message: "Friend request deleted" });
    } else if (type == "accept") {
      const statusUpdate = await FriendRequest.updateMany(
        {
          $or: [
            { sender: senderId, recipient: recipientId },
            { sender: recipientId, recipient: senderId },
          ],
          status: "pending",
        },
        {status:"accept"}
      )
      console.log(statusUpdate);
      const createFriend = new Friend({
        user1: senderId,
        user2: recipientId,
      });
      await createFriend.save();
      return res.status(201).json({ message: "Added to Friend List" });
    } else {
      const existingRequest = await FriendRequest.findOne({
        sender: senderId,
        recipient: recipientId,
        status: "pending",
      });

      if (existingRequest) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      const newFriendRequest = new FriendRequest({
        sender: senderId,
        recipient: recipientId,
      });

      await newFriendRequest.save();

      return res
        .status(201)
        .json({ message: "Friend request sent successfully" });
    }
  } catch (err) {
    console.error("Error from catch", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = handleFriendRequest;
