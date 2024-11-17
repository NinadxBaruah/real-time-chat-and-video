const { WebSocketServer, WebSocket } = require("ws");

const {
  setFriendsRoom,
  getFriendsRoom,
  friendsRoom,
} = require("../utils/friendsRoom");


const jwt = require("jsonwebtoken");
function onSocketPreError(e) {
  console.log("Socket Pre Error", e);
}
function onSocketPostError(e) {
  console.log("Socket Post Error:", e);
}

module.exports = function configure(server) {
  const wss = new WebSocketServer({ noServer: true });
  // this will triggered when http server try to upgrade the
  //conneciton to WebSocket, we can do auth here also distroy the socket if needed

  // Set up an interval outside the connection handler to send pings to all users
  setInterval(() => {
    // Iterate over all connected users in friendsRoom and send ping messages
    for (const [userId, ws] of friendsRoom.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }

  }, 30000); // Send ping every 30 seconds
  server.on("upgrade", (req, socket, head) => {
    socket.on("error", onSocketPreError);
    const urlParts = req.url.split("/");
  if (urlParts[1] == "send-message") {
      const authToken = req.headers["sec-websocket-protocol"];
      jwt.verify(authToken, process.env.jwt_secret, (err, user) => {
        if (err) {
          console.log("JWT verification failed:", err);
          socket.destroy();
          return;
        }

        req.user = user.userId;

        wss.handleUpgrade(req, socket, head, (ws) => {
          socket.removeListener("error", onSocketPreError);
          wss.emit("connection", ws, req);
        });
      });
    }
  });

  wss.on("connection", (ws, req) => {
    // console.log("client connected");
    ws.on("error", onSocketPostError);
    const urlParts = req.url.split("/");
    const roomId = urlParts[3];
 if (urlParts[1] === "send-message") {
      const userId = req.user;
      const storedWs = setFriendsRoom(userId, ws);
      // console.log("number of connected user",friendsRoom.size)
      ws.on("message", async (data) => {
        try {
          const {
            type,
            name,
            answer,
            candidate,
            offer,
            sendTo,
            message,
            picture,
            callTo,
            user_id,
          } = JSON.parse(data.toString());
          if (type === "send") {
            const recipientWs = getFriendsRoom(sendTo);
            if (recipientWs) {
              recipientWs.send(
                JSON.stringify({
                  type: "receive",
                  from: userId,
                  name: name,
                  message: message,
                  picture: picture,
                  timestamp: new Date().toISOString(),
                })
              );
            } else {
              ws.send(
                JSON.stringify({
                  type: "error",
                  error: "Recipient not found or offline",
                  to: sendTo,
                  timestamp: new Date().toISOString(),
                })
              );
            }
          }
          if(type == "is:online") {
            const is_user_available = getFriendsRoom(sendTo);
            const senderId = getFriendsRoom(user_id);
            if(is_user_available){
              senderId.send(JSON.stringify({type:"online:status",isOnline:"online"}))
            }
            else{
              senderId.send(JSON.stringify({type:"online:status",isOnline:"offline"}))
            }
          }
          if (type == "video-call") {
            const callingClient = getFriendsRoom(callTo);
            if (callingClient) {
              callingClient.send(
                JSON.stringify({
                  type: "video-call",
                  from: user_id,
                  name: name,
                })
              );
            }
          }

          if (type == "reject") {
            const clientToSend = getFriendsRoom(sendTo);
            if (clientToSend) {
              clientToSend.send(
                JSON.stringify({ type: "reject", from: user_id })
              );
            }
          }
          if (type == "call-ended") {
            const clientToSend = getFriendsRoom(sendTo);
            if (clientToSend) {
              clientToSend.send(
                JSON.stringify({ type: "call-ended", from: user_id })
              );
            }
          }
         
          if(type == "request:offer") {
            const clientToSend = getFriendsRoom(sendTo);
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"on:request:offer"}))
            }
          }
 
          if(type == "on:offer") {
            const clientToSend = getFriendsRoom(sendTo);
            console.log("offer recieved")
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"on:offer" , offer:offer}))
            }
          }
          if( type == "on:answer") {
            const clientToSend = getFriendsRoom(sendTo);
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"on:answer" , answer:answer}))
              }
          }
          if(type == "on:ice") {
            const clientToSend = getFriendsRoom(sendTo);
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"on:ice" , candidate:candidate}))
              }
          }
          if(type == "stop:sending:answer") {
            const clientToSend = getFriendsRoom(sendTo);
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"stop:sending:answer"}))
              }
          }
          if(type == "stop:sending:offer") {
            const clientToSend = getFriendsRoom(sendTo);
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"stop:sending:offer"}))
              }
          }
          if (type == "on:offer:reset") {
            const clientToSend = getFriendsRoom(sendTo);
            const userIDs = getFriendsRoom(user_id);
            if(userIDs) {
              userIDs.send(JSON.stringify({ type: "on:offer:reset" ,offer:offer}));
            }
            if (clientToSend) {
              clientToSend.send(JSON.stringify({ type: "on:offer:reset" ,offer:offer}));
            }
          }
          if(type == "user:typing"){
            const clientToSend = getFriendsRoom(sendTo);
            if(clientToSend) {
              clientToSend.send(JSON.stringify({type:"user:typing"}))
              }
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });

      // Clean up on disconnect
      ws.on("close", () => {
        // console.log("Client disconnected:", userId);
        // console.log("Removing from friendsRoom map...");
        const stringId = userId.toString();
        friendsRoom.delete(stringId);
        // console.log("Map size after removal:", friendsRoom.size);
      });
    } 
  });
};
