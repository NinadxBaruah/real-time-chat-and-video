let user_id;
let socket;
const modal = new Modal();
let caller_id;
let offer;
let remoteOffer;
let remoteAnswer;
let iceCandidates = [];

document.addEventListener("DOMContentLoaded", async () => {
  user_id = localStorage.getItem("video-chat-user-id");
  if (user_id === null) {
    user_id = await generateRandomString(8);
    localStorage.setItem("video-chat-user-id", user_id);
  }
  const userIdTag = document.getElementById("userId");
  userIdTag.textContent = user_id;
  console.log(user_id);

  // making socket conenction
  const domainUrl = window.location.href;
  const absoluteUrl = new URL(domainUrl);
  const hostName = absoluteUrl.host;
  connectToSocketServer();

  function connectToSocketServer() {
    socket = new WebSocket(`wss://${hostName}/video-chat`);

    socket.addEventListener("open", (event) => {
      console.log("Connected to server");

      socket.send(JSON.stringify({ type: "setUser", user_id: user_id }));
    });

    socket.addEventListener("message", (event) => {
      console.log("Message from server:", event.data);
      const data = JSON.parse(event.data);
      if (data.type == "calling-user-not-found") {
        console.log("user not found");
        modal.open({
          title: "User",
          message: "User not found!",
          buttonText: "Got it",
          backgroundColor: "#1e293b",
          textColor: "#f8fafc",
          accentColor: "#2563eb",
        });
      } else if (data.type == "incoming-call") {
        console.log("incoming call");
        playRingtone();
        caller_id = data.caller_id;
        callNotification.show({
          message: "User is calling",
          onAccept: async () => {
            // when user accept the call
            console.log("custom accept");
            caller_id = data.caller_id;
            // console.log(caller_id)
            idSection.style.display = "none";
            callSection.style.display = "none";
            await askForSdpFromRemoteUser();
            stopRingtone();
            pillContainer.style.display = "flex";
          },
          onReject: () => {
            // when user reject the call
            console.log("custom reject");
            stopRingtone();
            socket.send(
              JSON.stringify({ type: "rejectCall", caller_id: caller_id })
            );
          },
        });
      } else if (data.type == "call-rejected") {
        modal.open({
          title: "Rejected",
          message: "Call Request Rejected!",
          buttonText: "Got it",
          backgroundColor: "#1e293b",
          textColor: "#f8fafc",
          accentColor: "#2563eb",
        });
        if (peerConnection) {
          peerConnection.close();
          peerConnection = null; // Set it to null to indicate it's no longer active
          console.log("Peer connection closed.");
        }
        pillContainer.style.display = "none"
        // Stop all local media tracks
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            track.stop(); // Stop each track
          });
          localStream = null;
          localVideo.srcObject = null;
          remoteVideo.srcObject = null;
          console.log("Local media tracks stopped.");
        }
        loading.style.display = "none";
        idSection.style.display = "block";
        callSection.style.display = "block";
      } else if (data.type == "requesting-sdp") {
        socket.send(
          JSON.stringify({
            type: "offer",
            offer: offer,
            caller_id: data.user_id,
            user_id: user_id,
          })
        );
        caller_id = data.user_id;
        loading.style.display = "none";
      } else if (data.type == "remoteOffer") {
        remoteOffer = data.remoteOffer;
        console.log(data.remoteOffer);
        receiveCall();
      } else if (data.type == "remoteAnswer") {
        remoteAnswer = data.remoteAnswer;
        addAnswer();
      } else if (data.type == "candidate") {
        console.log("ice candidate on socket: ", data.candidate);
        addNewIceCandidate(data.candidate);
        pillContainer.style.display = "flex";
        // iceCandidates.forEach((ice) =>{
        //   socket.send(
        //     JSON.stringify({
        //       type: "candidate",
        //       candidate: ice,
        //       caller_id: caller_id,
        //     })
        //   );
        // })
      } else if (data.type == "initiate-call") {
        idSection.style.display = "none";
        callSection.style.display = "none";
        loading.style.display = "block";
        initiateCall();
      }
      else if(data.type == "stop:call") {
        const myButton = document.querySelector(".reject")
        myButton.click();
        showCallEndedModal()
        idSection.style.display = 'block'
        callSection.style.display = 'block'
        pillContainer.style.display = 'none'
      }
      // Handle the received data
    });

    socket.addEventListener("close", (event) => {
      console.log("Connection closed", event);
      // You can check the `event.code` and `event.reason` for more details
      // Attempt to reconnect after a delay
      setTimeout(connectToSocketServer, 3000);
    });
  }

  // Initialize modal
});
