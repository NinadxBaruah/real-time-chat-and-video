const User = require("../db/userModel");
const Friend = require("../db/Friend");
const FriendRequest = require("../db/FriendRequest");

const handleUserProfile = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  try {
    // Initialize userData and findUser to ensure they are accessible
    let userData = {};
    let findUser = [];
    let friendsListData = [];

    const friends = await Friend.find({
      $or: [{ user1: user }, { user2: user }],
    });

    if (friends.length > 0) {
      const friendsListIds = friends.map((item) => {
        return item.user1 == user ? item.user2 : item.user1;
      });

      findUser = await User.find({
        $or: [{ _id: user }, { _id: { $in: friendsListIds } }],
      });
      if (!findUser || findUser.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      userData = findUser
        .filter((item) => item._id == user)
        .map((item) => ({
          name: item?.name,
          bio: item?.bio,
          image: item?.picture,
        }))[0];

      friendsListData = findUser
        .filter((item) => item._id != user)
        .map((item) => ({
          id:item._id,
          name: item?.name,
          bio: item.bio || null,
          image: item?.picture,
        }));
      return res.status(200).json({
        message: "success",
        id:user,
        name: userData?.name,
        bio: userData?.bio,
        image: userData?.image,
        friendsList: friendsListData,
      });
    } else {
      userData = await User.findById(user);
      console.log("friendList: ", friendsListData)
      return res.status(200).json({
        message: "success",
        id:user,
        name: userData?.name,
        bio: userData?.bio,
        image: userData?.image,
        friendsList: friendsListData,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = handleUserProfile;
