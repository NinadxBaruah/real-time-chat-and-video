import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useSocket } from "../utils/useSocket";

const peerConfig = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
interface PeerConnectionResult {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
}

export const createPeerConnection = async (
  socket: WebSocket | null,
  id: string,
  user_id: string,
  localStream: MediaStream
): Promise<PeerConnectionResult> => {

  return new Promise((resolve, reject) => {
    try {
      const peerConnection = new RTCPeerConnection(peerConfig);
      const remoteStream = new MediaStream();
      // Signaling state change listener
      peerConnection.addEventListener("signalingstatechange", (event) => {
        console.log("Signaling State Change:", peerConnection.signalingState);
        // console.log(event);
      });

      // Add local tracks to the peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // ICE candidate listener
      peerConnection.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          console.log("Found an ICE candidate!", event.candidate);
          // Emit the new ICE candidate to the signaling server
          socket?.send(
            JSON.stringify({
              type: "ice",
              ice: event.candidate,
              sendTo: id,
              user_id: user_id,
            })
          );
        }
      });

      // Track event listener for receiving remote stream
      peerConnection.addEventListener("track", (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
          console.log("Adding track to the remote feed");
        });
      });

      resolve({
        peerConnection,
        remoteStream,
      });
    } catch (error) {
      reject();
      throw error;
    }
  });
};
