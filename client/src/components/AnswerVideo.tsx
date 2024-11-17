import React, { useEffect, useRef, useState } from "react";
import { CiVideoOff, CiVideoOn } from "react-icons/ci";
import { FcEndCall } from "react-icons/fc";
import { GoMute, GoUnmute } from "react-icons/go";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSocket } from "../utils/useSocket";
import { useNavigate } from "react-router-dom";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { createPeerConnection } from "../webrtcUtils/createPeerConnection";
import { useSocketMessage } from "../utils/SocketMessageContext";
import { createAnswer } from "../webrtcUtils/createAnswer";

export const AnswerVideo = () => {
  const { setVideoCallPage, userDetails, setUserDetails ,setShowIncomingCall} =
    useUserDetailsContext();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();
  const [showVideo, setShowVideo] = useState(true);
  const [showCallEnded, setShowCallEnded] = useState(false);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [isMute, setIsMute] = useState(false);
  const { socketMessage } = useSocketMessage();
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidateInit[]>([]);
  const callEndedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remoteStreams, setRemoteStream] = useState<MediaStream>();
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit>();
  const [readyForAnswer, setReadyForAnswer] = useState<boolean>(false);
  const [peerSignalingState , setPeerSignalingState] = useState<string>('');
  const [iceCandidatesToSend, setIceCandidatesToSend] = useState<
  RTCIceCandidateInit[]
>([]);
  const sendAnswerTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  async function handleGoBack() {
    navigate("/projects/chat-app");
    setVideoCallPage({ callerVideo: false, answerVideo: false, rest: true });
    socket?.send(
      JSON.stringify({
        type: "call-ended",
        sendTo: userDetails.incomingCall.id,
        user_id: userDetails.user_id,
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
        const videoStream = new MediaStream([localStreamRef.current.getVideoTracks()[0]]);
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
        ]
      });
      

      setPeerConnection(peer);

      console.log(userDetails.incomingCall.id);
    }

    fetchMedias();


    return () =>{
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
    }
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

      peerConnection.addEventListener("icecandidate", (event) => {
        console.log("new ice candidate: ");
        if (event.candidate) {
          setIceCandidatesToSend((prev) =>
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

      peerConnection.addEventListener("signalingstatechange", (event) => {
        console.log("signaling state change: ", peerConnection.signalingState);
        if(peerConnection.signalingState == "stable" && peerConnection?.remoteDescription){
          console.log("adding ice candidates")
          iceCandidates.forEach(async(ice) =>{
            await peerConnection.addIceCandidate(ice);
          })
        }
      });

      socket?.send(
        JSON.stringify({
          type: "request:offer",
          sendTo: userDetails.incomingCall.id.toString(),
        })
      );
    }
  }, [peerConnection]);

  useEffect(() => {
    if (answer) {
      sendAnswerTimer.current =  setInterval(() => {
        console.log("sneding answer");
        socket?.send(
          JSON.stringify({
            type: "on:answer",
            answer: answer,
            sendTo: userDetails.incomingCall.id,
          })
        );
      }, 2000);
    }

      // Cleanup the interval when answer changes or component unmounts
  return () => {
    if (sendAnswerTimer.current) {
      clearInterval(sendAnswerTimer.current);
      sendAnswerTimer.current = null;
    }
  };
  }, [answer]);



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

  },[iceCandidates ,peerConnection?.remoteDescription , peerConnection?.signalingState])



  useEffect(() =>{
    if(peerConnection?.iceConnectionState == "disconnected" || peerConnection?.iceConnectionState == "failed") {
      socket?.send(JSON.stringify({type:"request:restart",sendTo:userDetails.incomingCall.id}))
    }
  },[peerConnection?.iceConnectionState])

  useEffect(() => {
    const data = socketMessage.message;
    console.log("recieved message: ", data);
    async function fetchSocketMessage() {
      try {
        if (data.type == "on:offer") {
          console.log("recieved remote offer: ", data.offer);
          // if(peerConnection?.signalingState != "stable" && peerConnection?.signalingState != "have-remote-offer")
          // {
            await peerConnection?.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
            const answer = await peerConnection?.createAnswer();
            await peerConnection?.setLocalDescription(answer);
            console.log("answer created: ", answer);
            socket?.send(
              JSON.stringify({
                type: "on:answer",
                answer: answer,
                sendTo: userDetails.incomingCall.id,
              })
            );
            setAnswer(answer);
            // socket?.send(JSON.stringify({type:"stop:sending:offer" , sendTo:userDetails.incomingCall.id}))
          // }

        } else if (data.type == "call-ended") {
          setShowCallEnded(true);
          callEndedTimerRef.current = setTimeout(() => {
            setShowCallEnded(false);
            handleGoBack();
          }, 2000);
          setShowIncomingCall(false)
          console.log("call ended");
        } else if (data.type == "on:ice") {
          console.log("ice candidates recieved: ");
          setIceCandidates((prev) => {
            return [...prev, data.candidate];
          });
        } else if (data.type == "stop:sending:answer") {
          clearInterval(sendAnswerTimer.current!)
        } else if (data.type == "on:offer:reset") {
          console.log("offer recievd again: ",data.offer)
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

  //  else if (data.type == "call-ended") {
  //         setShowCallEnded(true);
  //         callEndedTimerRef.current = setTimeout(() => {
  //           setShowCallEnded(false);
  //           handleGoBack();
  //         }, 2000);
  //         console.log("call ended");
  //       }

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
