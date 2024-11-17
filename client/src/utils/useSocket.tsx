import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSocketMessage } from "../utils/SocketMessageContext";
import { useUserDetailsContext } from "./UserDetailsContext";
import { useNavigate } from "react-router-dom";

// Define the shape of the socket context
interface SocketContextType {
  socket: WebSocket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Create a provider to manage the WebSocket connection globally
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const { setSocketMessage } = useSocketMessage();

  const { setUserDetails, setShowIncomingCall } = useUserDetailsContext();

  const navigate = useNavigate();

  useEffect(() => {
    const authToken = Cookies.get("__authToken");

    if (!authToken) {
      console.error("No auth token found.");
      return;
    }

    // Avoid re-establishing the WebSocket if it already exists
    if (!socket) {
      try {
        const ws = new WebSocket(
          `ws://${import.meta.env.VITE_APP_BACKEND_URL_WS}/send-message`,
          authToken
        );
        ws.onopen = () => {
          console.log("WebSocket connection established.");
        };

        ws.onmessage = (event) => {
          // console.log("Message received:", event.data);
          const data = JSON.parse(event.data);
          setSocketMessage({ message: data });

          // if (data.type === "reject") {
          //   console.log("message received");
          //   navigate("/projects/chat-app");
          //     setVideoCallPage({ videoCall: false, rest: true });
          // }
          // if (data.type == "video-call") {
          //   console.log("use socket: ",data.from);
          //   setUserDetails((prev) => {
          //     return {
          //       ...prev,
          //       incomingCall: { id: data.from, name: data.name },
          //     };
          //   });
          //   setShowIncomingCall(true);
          // }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed.");
        };

        setSocket(ws);
      } catch (err) {
        console.error("Error establishing WebSocket connection:", err);
      }

      // return () => {
      //   ws.close();
      // };
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to access the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
