const mongoose = require("mongoose");

const MessagesSchema = mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  image:{
    type:String
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reciever: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Messages = mongoose.model("Messages", MessagesSchema);

module.exports = Messages;
