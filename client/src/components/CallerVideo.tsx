import { useEffect, useRef, useState } from "react";
import { CiVideoOff, CiVideoOn } from "react-icons/ci";
import { FcEndCall } from "react-icons/fc";
import { GoMute, GoUnmute } from "react-icons/go";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Navigate, useNavigate } from "react-router-dom";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useSocket } from "../utils/useSocket";
import { createPeerConnection } from "../webrtcUtils/createPeerConnection";
import { useSocketMessage } from "../utils/SocketMessageContext";
import { createOffer } from "../webrtcUtils/createOffer";

export const CallerVideo = () => {
  const { setVideoCallPage, userDetails ,setShowIncomingCall } = useUserDetailsContext();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [remoteStreams, setRemoteStream] = useState<MediaStream>();
  const [showVideo, setShowVideo] = useState(true);
  const [showCallEnded, setShowCallEnded] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const { socketMessage } = useSocketMessage();
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidateInit[]>([]);
  const [peerSignalingState , setPeerSignalingState] = useState<string>('');
  const [iceCandidatesToSend, SetIceCandidatesToSend] = useState<
    RTCIceCandidateInit[]
  >([]);
  let offerTimeOut: ReturnType<typeof setInterval>;
  const callEndedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [offer, setOffer] = useState<RTCSessionDescriptionInit>();
  async function handleGoBack() {
    navigate("/projects/chat-app");
    setVideoCallPage({ callerVideo: false, answerVideo: false, rest: true });
    socket?.send(
      JSON.stringify({
        type: "call-ended",
        sendTo: userDetails.incomingCall.id.toString(),
        user_id: userDetails.user_id.toString(),
      })
    );

    if (callEndedTimerRef.current) {
      clearTimeout(callEndedTimerRef.current); // Clear the timer if still running
    }
    setShowCallEnded(false);
    // Cleanup WebRTC and media
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  }

  useEffect(() => {
    async function fetchMedias() {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current && localStreamRef.current) {
        const videoStream = new MediaStream([
          localStreamRef.current.getVideoTracks()[0],
        ]);
        localVideoRef.current.srcObject = videoStream
      }

      const peer = new RTCPeerConnection({
        iceServers: [
          // Google STUN servers
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      });

      setPeerConnection(peer);

      socket?.send(
        JSON.stringify({
          type: "video-call",
          name: userDetails.name,
          callTo: userDetails.incomingCall.id.toString(),
          user_id: userDetails.user_id,
        })
      );

      console.log(userDetails.incomingCall.id);
    }

    fetchMedias();

    return () => {
      // Cleanup WebRTC and media
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      }
     if(callEndedTimerRef.current) clearTimeout(callEndedTimerRef.current)
    };
  }, []);

  useEffect(() => {
    if (localStreamRef.current && peerConnection) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          peerConnection.addTrack(track, localStreamRef.current!)
        );

      // Initialize remote stream and assign it to remoteVideoRef
      remoteStreamRef.current = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }

      peerConnection.addEventListener("track", (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current?.addTrack(track);
        });
      });
      peerConnection.addEventListener("signalingstatechange", (event) => {
        console.log("signaling state change: ", peerConnection.signalingState);
        if(peerConnection.signalingState == "stable"){
          console.log("adding ice candidates")
          iceCandidates.forEach(async(ice) =>{
            await peerConnection.addIceCandidate(ice);
          })
        }
      });


      peerConnection.addEventListener("icecandidate", (event) => {
        console.log("new ice candidate: ");
        if (event.candidate) {
          SetIceCandidatesToSend((prev) =>
            event.candidate ? [...prev, event.candidate] : prev
          );

          socket?.send(
            JSON.stringify({
              type: "on:ice",
              candidate: event.candidate,
              sendTo: userDetails.incomingCall.id,
            })
          );
        }
      });

      async function createOffer() {
        if (peerConnection) {
        }
      }
      createOffer();
    }
  }, [peerConnection]);


  useEffect(() =>{
    if(peerConnection?.signalingState === "stable" && peerConnection?.remoteDescription ){
      try {
        console.log(`adding ice from useEffect and the signalling state is ${peerConnection.signalingState}`)
        iceCandidates.forEach(async(ice) =>{
          await peerConnection?.addIceCandidate(ice);
        })
      } catch (error) {
        console.log("error while adding ice from use Effect",error)
      }

    }

  },[iceCandidates , peerConnection?.remoteDescription , peerConnection?.signalingState])

  useEffect(() => {
    async function sendOfferAgian() {
      if (
        peerConnection?.iceConnectionState == "failed" ||
        peerConnection?.iceConnectionState == "disconnected"
      ) {
        const offer = await peerConnection?.createOffer({ iceRestart: true });
        console.log("offer created again");
        await peerConnection?.setLocalDescription(offer);
        console.log("sending offer again", offer);
        socket?.send(
          JSON.stringify({
            type: "on:offer:reset",
            offer: offer,
            sendTo: userDetails.incomingCall.id,
            user_id: userDetails.user_id,
          })
        );
      }
    }
    sendOfferAgian();
  }, [peerConnection]);

  useEffect(() => {
    const data = socketMessage.message;
    console.log("recieved message: ", data);
    async function fetchSocketMessage() {
      try {
        if (data.type == "on:request:offer") {
          if (peerConnection) {
            // const offer = await peerConnection.createOffer();
            // await peerConnection.setLocalDescription(offer);
            // setOffer(offer);
            try {
              console.log("rq for offer recieved");
              const offerSDP = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offerSDP);
              console.log("offer created: ", offerSDP);
              setOffer(offerSDP);


              setTimeout(async () =>{
                console.log("sending offer")
                socket?.send(
                  JSON.stringify({
                    type: "on:offer",
                    offer: offerSDP,
                    sendTo: userDetails.incomingCall.id,
                  })
                );
              },1000)

            } catch (error) {
              console.log("error while creating offer: ", error);
            }
          }
        } else if (data.type == "on:answer") {
          console.log("recieved answer from remote: ", data.answer);
          if (peerConnection?.signalingState != "stable") {
            await peerConnection?.setRemoteDescription(data.answer);
          }
          if (peerConnection?.signalingState == "stable") {
            socket?.send(
              JSON.stringify({
                type: "stop:sending:answer",
                sendTo: userDetails.incomingCall.id.toString(),
              })
            );
          }
        } else if (data.type == "call-ended") {
          setShowCallEnded(true);
          callEndedTimerRef.current = setTimeout(() => {
            setShowCallEnded(false);
            handleGoBack();
          }, 2000);
          setShowIncomingCall(false)
        } else if (data.type == "on:ice") {
          console.log("ice candidates recieved: ");
          setIceCandidates((prev) => {
            return [...prev, data.candidate];
          });
        } else if (data.type == "request:restart") {
          const offer = await peerConnection?.createOffer({ iceRestart: true });
          await peerConnection?.setLocalDescription(offer);
          console.log("sending offer again");
          socket?.send(
            JSON.stringify({
              type: "on:offer",
              offer: offer,
              sendTo: userDetails.incomingCall.id,
            })
          );
        } else if (data.type == "on:offer:reset") {
          console.log("recieved offer :", data.offer);
        }
        else if (data.type == "stop:sending:offer") {
          clearInterval(offerTimeOut)
        }
        else if(data.type == "reject") {
          handleEndCall()
        }
      } catch (error) {
        console.log("error while fetching socketMessgae: ", error);
      }
    }

    fetchSocketMessage();
  }, [socketMessage.message]);

  // Call the same clear timeout logic in the handleGoBack function
  const handleEndCall = () => {
    if (callEndedTimerRef.current) {
      clearTimeout(callEndedTimerRef.current); // Clear the timer if still running
    }
    setShowCallEnded(false);
    handleGoBack();
  };

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
              onClick={handleEndCall}
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
