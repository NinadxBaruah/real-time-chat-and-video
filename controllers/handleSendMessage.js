const Messages = require("../db/Messages");
const User = require("../db/userModel");
const mongoose = require("mongoose");

const handleSendMessage = async (req, res) => {
  const senderId = req.user;
  const { message, recieverId, type, image } = req.body;

  if (type === "send") {
    if (!senderId || !message || !recieverId) {
      return res.status(400).json({ message: "Bad Request" });
    }
    try {
      const Message = await Messages.create({
        message: message,
        image: image ? image : "",
        sender: senderId,
        reciever: recieverId,
      });

      // console.log(Message);
      if (!Message) {
        return res.status(400).json({ message: "Message not sent" });
      }

      return res
        .status(201)
        .json({ message: "Message Successfully created!", Message });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (type === "allMessages") {
    try {
      const latestMessages = await Messages.find({
        $or: [{ sender: senderId }, { reciever: senderId }],
      }).sort({ createdAt: -1 });

      const filteredData = [
        ...latestMessages
          .reduce((map, item) => {
            const key = [item.sender, item.reciever].sort().join("");
            if (!map.has(key)) {
              map.set(key, item);
            }
            return map;
          }, new Map())
          .values(),
      ];

      const userIds = filteredData.map((item) => {
        if (item.sender == senderId) {
          return {
            id: item.reciever,
            sender: senderId,
            message: item.message,
            timeStamp: item.createdAt,
          };
        } else {
          return {
            id: item.sender,
            sender: item.sender,
            message: item.message,
            timeStamp: item.createdAt,
          };
        }
      });

      const userData = await User.find({
        _id: { $in: [...userIds.map((item) => item.id)] },
      });

      const mergedData = userIds.map((user) => {
        const matchedUser = userData.find(
          (data) => data._id.toString() === user.id.toString()
        );
        return {
          ...user,
          name: matchedUser ? matchedUser.name : "",
          picture: matchedUser ? matchedUser.picture : "",
        };
      });
      // console.log(userData)
      return res.status(200).json({ message: "success", mergedData });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }
};

module.exports = handleSendMessage;

// const Messages = require("../db/Messages");
// const User = require("../db/userModel");
// const mongoose = require("mongoose");

// const handleSendMessage = async (req, res) => {
//   const senderId = req.user;
//   const { message, recieverId, type } = req.body;

//   if (type === "send") {
//     if (!senderId || !message || !recieverId) {
//       return res.status(400).json({ message: "Bad Request" });
//     }
//     try {
//       const Message = await Messages.create({
//         message: message,
//         sender: senderId,
//         reciever: recieverId,
//       });

//       if (!Message) {
//         return res.status(400).json({ message: "Message not sent" });
//       }

//       return res.status(201).json({ message: "Message Successfully created!" });
//     } catch (err) {
//       console.log(err);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else if (type === "allMessages") {
//     try {
//       const latestMessages = await Messages.find({
//         $or: [{ sender: senderId }, { reciever: senderId }],
//       }).sort({ createdAt: -1 });

//       const filteredData = [
//         ...latestMessages
//           .reduce((map, item) => {
//             const key = [item.sender, item.reciever].sort().join("");
//             if (!map.has(key)) {
//               map.set(key, item);
//             }
//             return map;
//           }, new Map())
//           .values(),
//       ];

//       const userIds = filteredData.map((item) => {
//         if (item.sender == senderId) {
//           return {
//             id: item.reciever,
//             senderId: item.sender,
//             message: item.message,
//             timeStamp: item.createdAt,
//           };
//         } else {
//           return {
//             id: item.sender,
//             senderId: item.sender,
//             message: item.message,
//             timeStamp: item.createdAt,
//           };
//         }
//       });

//       const userData = await User.find({
//         _id: { $in: [...userIds.map((item) => item.id)] },
//       });

//       const mergedData = userIds.map((user) => {
//         const matchedUser = userData.find(data => data._id.toString() === user.id.toString());
//         return {
//           ...user,
//           name: matchedUser ? matchedUser.name : "",
//           picture: matchedUser ? matchedUser.picture : "",
//         };
//       });

//       return res.status(200).json({ message: "success", mergedData });
//     } catch (err) {
//       console.log(err);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     return res.status(400).json({ message: "Invalid type" });
//   }
// };

// module.exports = handleSendMessage;
