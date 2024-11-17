const mongoose = require("mongoose");

mongoose.connect(`${process.env.mongo_db_uri}` + `chat-app`);

const db = mongoose.connection;

db.on("error", (err) => {
  console.error(err);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});
