const callButton = document.getElementById("callButton");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let stream;
let localStream;
let remoteStream;
let peerConnection;


const peerConfig = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const constraints = {
  video: true,
  audio: true,
}

const initiateCall = async () => {
  try {
    // Access the media devices and set the local video stream
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoStream = new MediaStream([stream.getVideoTracks()[0]]);
    localVideo.srcObject = videoStream;
    localStream = stream;

    // Create the peer connection
    await createPeerConnection();

    // Create and set the local offer
    try {
      offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Offer: ", offer);
      // socket.send(
      //   JSON.stringify({ type: "offer", sdp: offer, user_id: user_id })
      // );
    } catch (error) {
      console.log("Error creating or setting local description:", error);
    }
  } catch (error) {
    console.log("Error accessing media devices:", error);
  }
};
const createPeerConnection = (remoteOffer) => {
  return new Promise((resolve, reject) => {
    // Create the peer connection
    peerConnection = new RTCPeerConnection(peerConfig);
    remoteStream = new MediaStream()
    remoteVideo.srcObject = remoteStream
    // Add local tracks to the peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Listen for ICE candidates
    peerConnection.addEventListener("icecandidate", (e) => {
      if (e.candidate) {
        console.log("ICE candidate found:", e.candidate);

        iceCandidates.push(e.candidate)
        console.log(iceCandidates)
        socket.send(
          JSON.stringify({
            type: "candidate",
            candidate: e.candidate,
            caller_id: caller_id,
          })
        );
        // You can send the candidate to the remote peer here
      }
    });

    peerConnection.addEventListener("track" , (e) =>{
      console.log("***********tracks***********")
      e.streams[0].getTracks().forEach((track) =>{
        remoteStream.addTrack(track , remoteStream);
        pillContainer.style.display = "flex"
        console.log("track added")
      })
    })

    peerConnection.addEventListener('connectionstatechange', () => {
    
      if (peerConnection.connectionState === 'disconnected') {
        console.log('Peer-to-peer connection disconnected');
        pillContainer.style.display = 'none'
        idSection.style.display = 'block'
        callSection.style.display = 'block'
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
        // Handle disconnection (e.g., reconnect logic)
      } else if (peerConnection.connectionState === 'failed') {
        console.log('Peer connection failed');
        // Handle failure
      } else if (peerConnection.connectionState === 'closed') {
        console.log('Peer connection closed');
        // Handle the closed connection
      }
    });

    if(remoteOffer){
      peerConnection.setRemoteDescription(remoteOffer)
    }

    // Resolve the promise once the peer connection is created
    resolve(peerConnection);
  });
};

callButton.addEventListener("click", () => {
  if (callInput.value.length < 7) {
    console.log("less");
    modal.open({
      title: "Invalid",
      message: "Enter a valid caller Id",
      buttonText: "Got it",
      backgroundColor: "#1e293b",
      textColor: "#f8fafc",
      accentColor: "#2563eb",
    });
  }
  else{
    // asking backend to call
    pillContainer.style.display = "flex";
    idSection.style.display = "none"
    callSection.style.display = "none"
    socket.send(JSON.stringify({type:"call" , callerId: callInput.value , user_id:user_id}))
    // initiateCall();
  }
});

const addNewIceCandidate = async (candidate) => {
  // Create a new ICE candidate
  await peerConnection.addIceCandidate(candidate);
  console.log("*******ice candidate added**********")
}

const addAnswer = async() => {
  console.log("remote answer: ", remoteAnswer)
  await peerConnection.setRemoteDescription(remoteAnswer)
  iceCandidates.forEach((ice) =>{
    socket.send(
      JSON.stringify({
        type: "candidate",
        candidate: ice,
        caller_id: caller_id,
      })
    );
  })
}


const receiveCall = async () =>{

  try {
      // Receive the call from the remote peer
  await fetchUserMedia();
  
  await createPeerConnection(remoteOffer)

  const answer = await peerConnection.createAnswer({})

  peerConnection.setLocalDescription(answer)

  socket.send(JSON.stringify({type:"answer" , answer:answer , caller_id:caller_id}))

  console.log(answer)
  } catch (error) {
    console.log(error)
  }

}

const askForSdpFromRemoteUser = () =>{
  return new Promise((resolve , reject) =>{
    try {
      socket.send(JSON.stringify({type:"requesting-sdp" , caller_id:caller_id , user_id:user_id}))
      resolve()
    } catch (error) {
      console.log(error)
      reject()
    }
  }) 
}

const fetchUserMedia = () =>{
  return new Promise(async(resolve , reject) =>{
    try {
      stream = await navigator.mediaDevices.getUserMedia({video:true , audio:true})
      localVideo.srcObject = stream
      localStream = stream
      resolve();
    } catch (error) {
      console.log(error);
      reject();
    }
  })
}
