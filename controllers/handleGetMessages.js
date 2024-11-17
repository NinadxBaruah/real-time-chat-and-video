const Messages = require("../db/Messages");
const handleGetMessages = async (req, res) => {
  const user_id = req.user;
  const { reciever } = req.body;
  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const messages = await Messages.find({
        $or: [
          { sender: user_id, reciever: reciever },
          { sender: reciever, reciever: user_id },
        ],
      })
      .populate('sender', 'name')
      .sort({ createdAt: -1 });

    if(!messages.length){
       return res.status(404).json({message:"No message found!"})
    }

    const messagesData = messages.map((item) => ({
      id: item.sender._id.toString(),
      senderName:item.sender.name,
      message: item.message,
    picture:item.image,
      timeStamp: item.createdAt,
      // sender:item.sender
    }));

    // console.log(messages);

    return res.status(200).json({message:"success",messagesData})
  } catch (error) {
    console.error("Failed to fetch messages:", error);
  }
};

module.exports = handleGetMessages;
