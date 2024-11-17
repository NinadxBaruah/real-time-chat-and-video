import React, { useEffect, useRef, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FcEndCall } from "react-icons/fc";
import { useSocketMessage } from "../utils/SocketMessageContext";
import { useSocket } from "../utils/useSocket";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useRtc } from "../utils/RtcProvider";
import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";
import { GoMute } from "react-icons/go";
import { GoUnmute } from "react-icons/go";

interface VideoCallType {
  videoCall: boolean;
  rest: boolean;
}

interface VideoCallProps {
  setShowLeftHomePage?: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoCallPage: React.Dispatch<React.SetStateAction<VideoCallType>>;
  setShowIncomingCall: React.Dispatch<React.SetStateAction<boolean>>;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  setShowLeftHomePage,
  setVideoCallPage,
  setShowIncomingCall,
}) => {
  const navigate = useNavigate();

  const {
    peerConnection,
    createOffer,
    createAnswer,
    addIceCandidate,
    iceCandidates,
  } = useRtc();

  const { socketMessage, setSocketMessage } = useSocketMessage();

  const [showCallEnded, setShowCallEnded] = useState(false);
  // const localStreamRef = useRef<MediaStream | null>(null);
  // const remoteStreamRef = useRef<MediaStream | null>(null);
  // const [iceCandidates , setIceCandidates]  = useState<RTCIceCandidate[]>([])
  const { socket } = useSocket();
  const { userDetails } = useUserDetailsContext();
  const [signalingState, SetSignalingState] = useState<string>("new");
  const [isMute, setIsMute] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [peerIceStatus, setPeerIceStatus] = useState<string>("new");
  const addedIceCandidates = new Set<RTCIceCandidateInit>();
  const remoteIceCandidates = useRef<RTCIceCandidateInit[]>();
  let stream: MediaStream;
  let remoteStream: MediaStream;
  let offer: RTCSessionDescriptionInit;
  // const iceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  async function handleGoBack() {
    navigate("/projects/chat-app");
    setVideoCallPage({ videoCall: false, rest: true });
    socket?.send(
      JSON.stringify({
        type: "call-ended",
        sendTo: userDetails.incomingCall.id,
        user_id: userDetails.user_id,
      })
    );
    // Cleanup media
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
  }
  // Initialize local media stream
  useEffect(() => {
    async function fetchUserMedia() {
      try {
        console.log("Requesting media permissions...");
        if (userDetails.incomingCall.type == "recieve") {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
        }

        console.log(
          "Media stream obtained:",
          stream.getTracks().map((track) => track.kind)
        );

        // Set local video
        if (localVideoRef.current) {
          const videoStream = new MediaStream([stream.getVideoTracks()[0]]);
          // const videoStream = new MediaStream(stream.getTracks());
          localVideoRef.current.srcObject = videoStream;
          console.log("Local video stream set");
        }

        // if (localStreamRef.current) {
        //   localStreamRef.current.getTracks().forEach((track) => {
        //     peerConnection?.addTrack(
        //       track,
        //       localStreamRef.current as MediaStream
        //     );
        //   });
        // }
        // Add tracks to peer connection
        if (peerConnection && stream) {
          stream.getTracks().forEach((track) => {
            
            peerConnection.addTrack(track, stream);
          });
        }
  

        // if (peerConnection) {
        //   peerConnection.ontrack = (event) => {
        //     console.log("Received remote track:", event.track.kind);
        //     if (remoteVideoRef.current) {
        //       remoteVideoRef.current.srcObject = event.streams[0];
        //       console.log("Remote video stream set", event.streams);
        //     }
        //   };
        // }
        // Set up remote stream handling
        if (peerConnection) {
          peerConnection.ontrack = (event) => {
            console.log("Received remote track:", event.track.kind);
            remoteStreamRef.current = event.streams[0];
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };
        }
      } catch (error) {
        console.error("Error setting up local media:", error);
      }
    }

    fetchUserMedia();

    if ((userDetails.incomingCall.type = "recieve")) {

      setTimeout(() =>{
        socket?.send(
          JSON.stringify({
            type: "request:offer",
            sendTo: userDetails.incomingCall.id.toString(),
            user_id: userDetails.user_id.toString(),
          })
        );
      },3000)

    }
    // Cleanup
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // async function addTracksFrom(stream:MediaStream) {
  //   return new Promise((resolve , reject) =>{
  //     try {
  //       if (peerConnection && stream) {
  //         stream.getTracks().forEach((track) => {
  //           peerConnection.addTrack(track, stream);
  //         });
  //       }
  //       resolve(stream);
  //     } catch (error) {
  //       console.log("error while adding tracks")
  //       reject()
  //     }

  //   })

  // }

  useEffect(() => {
    const data = socketMessage.message;
    async function fetchSocketMessage() {
      if (data.type == "call-ended") {
        setShowCallEnded(true);
        setTimeout(() => {
          setShowCallEnded(false);
          handleGoBack();
        }, 2000);
        console.log("call ended");
      } else if (data.type == "on:request:offer") {
        console.log("got offer request");
        const offer = await peerConnection?.createOffer();
        peerConnection?.setLocalDescription(offer);
        console.log("offer: ", offer);
        socket?.send(
          JSON.stringify({
            type: "offer",
            offer: offer,
            sendTo: userDetails.incomingCall.id.toString(),
            user_id: userDetails.user_id.toString(),
          })
        );
      } else if (data.type == "on:offer") {
        await peerConnection?.setRemoteDescription(data.offer);
        const answer = await peerConnection?.createAnswer(
          new RTCSessionDescription(data.offer)
        );
        await peerConnection?.setLocalDescription(answer);
        console.log("generatting answer: ", answer);
        socket?.send(
          JSON.stringify({
            type: "answer",
            answer: answer,
            sendTo: userDetails.incomingCall.id.toString(),
            user_id: userDetails.user_id.toString(),
          })
        );
      } else if (data.type == "on:answer") {
        console.log("got answer: ", data.answer);
        peerConnection?.setRemoteDescription(data.answer);
      } else if (data.type == "on:ice") {
        console.log("got ice candidates:--------------->", data.ice);
        if (
          peerConnection?.signalingState == "stable" ||
          peerConnection?.signalingState == "have-remote-offer"
        ) {
          data.ice.forEach(async (ice: RTCIceCandidateInit) => {
            if (!addedIceCandidates.has(ice)) {
              addedIceCandidates.add(ice);
              if (peerConnection.connectionState != "connected") {
                await peerConnection?.addIceCandidate(ice);
              }
            }
          });
        } else {
          data.ice.forEach((element: RTCIceCandidateInit) => {
            if (!addedIceCandidates.has(element)) {
              addedIceCandidates.add(element);
            }
          });
        }
      }
    }
    fetchSocketMessage();
  }, [socketMessage.message]);

  useEffect(() => {
    if (iceCandidates && iceCandidates.length > 0) {
      console.log("All ICE candidates gathered:", iceCandidates);
      // Your code to run once after all candidates are gathered
      socket?.send(
        JSON.stringify({
          type: "ice",
          ice: iceCandidates,
          sendTo: userDetails.incomingCall.id.toString(),
          user_id: userDetails.user_id.toString(),
        })
      );
    }

  }, [iceCandidates, peerConnection?.iceGatheringState ]);

  useEffect(() => {
    async function addIceCandidateFromSet() {
      if (
        peerConnection?.signalingState == "stable" ||
        peerConnection?.signalingState == "have-remote-offer"
      ) {
        addedIceCandidates.forEach(async (ice) => {
          if (peerConnection.connectionState != "connected") {
            await peerConnection.addIceCandidate(ice);
          }
        });
      }
    }
    addIceCandidateFromSet();
  }, [peerConnection?.signalingState]);

  useEffect(() => {
    if (peerConnection?.iceConnectionState == "disconnected" || peerConnection?.iceConnectionState == "failed") {
      console.log("adding ice candidates again")
      addedIceCandidates.forEach(async (ice) => {
        if (peerConnection) {
          await peerConnection.addIceCandidate(ice);
        }
      });
    }
  }, [peerConnection?.connectionState, peerConnection?.iceConnectionState]);

  const toggleMute = () => {
    setIsMute((prev) => !prev);
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack?.enabled) {
      audioTrack.enabled = false;
    } else {
      if (audioTrack) audioTrack.enabled = true;
    }
  };
  const toggleVideo = () => {
    setShowVideo((prev) => !prev);
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack?.enabled) {
      videoTrack.enabled = false;
    } else {
      if (videoTrack) videoTrack.enabled = true;
    }
  };

  useEffect(() => {
    // Add listener for connection state change
    peerConnection?.addEventListener("connectionstatechange", () => {
      if (peerConnection.connectionState === "connected") {
        console.log("new Peer connection established.");
        peerConnection.ontrack = (event) => {
          console.log("Received remote track:", event.track.kind);
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        // Set remote video source to remote stream
        if (remoteVideoRef.current && remoteStreamRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
      }
    });



    
  
    return () => {
      // Clean up event listener on component unmount
      peerConnection?.removeEventListener("connectionstatechange", () => {});
    };
  }, [peerConnection]);
  
  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-gray-900 to-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition-all"
            >
              <IoMdArrowRoundBack size={24} className="text-white" />
            </button>
            <h1 className="text-xl font-semibold text-white">Ninad Baruah</h1>
          </div>
          <div className="px-3 py-1 rounded-full bg-gray-800 bg-opacity-50 text-white text-sm">
            12:30
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex">
          {/* Main Video (Remote) */}
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              ref={remoteVideoRef}
            />
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-gray-900 bg-opacity-60 rounded-full text-white text-sm">
              Remote User
            </div>
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-20 right-4 w-32 md:w-48 aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-gray-800">
            <video
              className={`w-full h-full object-cover ${
                showVideo ? "" : "hidden"
              }`}
              autoPlay
              playsInline
              ref={localVideoRef}
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-gray-900 bg-opacity-60 rounded-full text-white text-xs">
              You
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
          <div className="flex justify-center items-center gap-4">
            {showCallEnded && (
              <span className="text-red-600 absolute top-0">call ended</span>
            )}
            <button
              onClick={toggleVideo}
              className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-all shadow-lg"
            >
              {showVideo ? (
                <CiVideoOn size={32} className="text-white" />
              ) : (
                <CiVideoOff size={32} className="text-white" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-all shadow-lg"
            >
              {isMute ? (
                <GoMute size={32} className="text-white" />
              ) : (
                <GoUnmute size={32} className="text-white" />
              )}
            </button>

            <button
              onClick={handleGoBack}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg"
            >
              <FcEndCall size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
