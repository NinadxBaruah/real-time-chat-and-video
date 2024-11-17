import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useSocket } from "./useSocket";
import {
  UserDetailsProvider,
  useUserDetailsContext,
} from "./UserDetailsContext";

interface RtcContextType {
  peerConnection: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | undefined>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit | undefined>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  iceCandidates: RTCIceCandidateInit[] | undefined;
}

const RtcContext = createContext<RtcContextType | null>(null);

interface RtcProviderProps {
  children: ReactNode;
}

const RtcProvider: React.FC<RtcProviderProps> = ({ children }) => {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const { socket } = useSocket();
  const { userDetails } = useUserDetailsContext();
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);


  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const peerConfig = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        },
      ],
      iceCandidatePoolSize: 10
    };

    const pc = new RTCPeerConnection(peerConfig);

    // Enhanced ICE candidate logging
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        setIceCandidates(prev => [...prev, event.candidate as RTCIceCandidate]);
        console.log("New ICE candidate:", {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Log ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
    };

    // Log ICE gathering state changes
    pc.onicegatheringstatechange = () => {
      console.log("ICE Gathering State:", pc.iceGatheringState);
    };

    // Log signaling state changes
    pc.onsignalingstatechange = () => {
      console.log("Signaling State:", pc.signalingState);
    };

    pc.onnegotiationneeded = () =>{
        socket?.send(JSON.stringify({type:"request-sdp" , sendTo:userDetails.incomingCall.id.toString(), user_id:userDetails.user_id.toString()}))
    }

    setPeerConnection(pc);

    return () => {
      pc.close();
    };
  }, []);


  const createOffer = async () => {
    try {
      if (peerConnection) {
        console.log("Creating offer...");
        const offer = await peerConnection.createOffer();
        console.log("Offer created:", offer);
        await peerConnection.setLocalDescription(offer);
        console.log("Local description set for offer");
        return offer;
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnection) {
        console.log("Setting remote description for offer...");
        await peerConnection.setRemoteDescription(offer);
        console.log("Remote description set for offer");

        console.log("Creating answer...");
        const answer = await peerConnection.createAnswer();
        console.log("Answer created:", answer);

        await peerConnection.setLocalDescription(answer);
        console.log("Local description set for answer");

        return answer;
      }
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      console.log("Adding ICE candidate:", candidate);
      await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added successfully");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  return (
    <RtcContext.Provider
      value={{
        peerConnection,
        createOffer,
        createAnswer,
        addIceCandidate,
        iceCandidates,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
};

const useRtc = () => {
  const context = useContext(RtcContext);
  if (!context) {
    throw new Error("useRtc must be used within an RtcProvider");
  }
  return context;
};

export { RtcProvider, useRtc };
