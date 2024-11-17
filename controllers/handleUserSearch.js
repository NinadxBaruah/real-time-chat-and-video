const User = require("../db/userModel");
const friendRequest = require("../db/FriendRequest");

const handleUserSearch = async (req, res) => {
  const { name } = req.query;
  const userId = req.user;
  if (!name) {
    return res.status(400).json({ message: "Please provide a name" });
  }

  try {
    const users = await User.find({
      name: {
        $regex: name,
        $options: "i",
      },
    });

    if (users.length > 0) {
      const filterUserData = users
        .filter((item) => item._id.toString() !== userId)
        .map((item) => ({
          name: item.name,
          id: item._id.toString(),
          image: item.picture,
          bio: item.bio,
        }));

      const friendRequests = await friendRequest.find({
        $or: [
          { sender: userId, recipient: { $in: filterUserData.map(user => user.id) } },
          { recipient: userId, sender: { $in: filterUserData.map(user => user.id) } }
        ]
      });

      const dataToSend = filterUserData.map((item) => {
        const request = friendRequests.find(req => 
          (req.recipient.toString() === item.id && req.sender.toString() === userId) ||
          (req.sender.toString() === item.id && req.recipient.toString() === userId)
        );
        return {
          ...item,
          isFriendRequestSent: !!request,
          status: request ? request.status : null
        };
      });

      return res.status(200).json({ message: "success", user: dataToSend });
    }
    return res.status(200).json({ message: "success", user: [] });
  } catch (error) {
    console.error("Error in handleUserSearch:", error);
    return res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

module.exports = handleUserSearch;