import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useMessageContext } from "../utils/MessagesContext";
import Cookies from "js-cookie";
import { useSocket } from "../utils/useSocket";
import { FaVideo } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { useSocketMessage } from "../utils/SocketMessageContext";
import { FaPaperclip } from "react-icons/fa";
import chatAppBg from '../../public/images/chatApp-bg.jpeg';


interface VideoCallType {
  videoCall: boolean;
  rest: boolean;
}
interface InboxType {
  id?: string;
  name?: string;
  image?: string;
  setShowInbox?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLeftHomePage?: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoCallPage?: React.Dispatch<React.SetStateAction<VideoCallType>>;
}
interface MessageType {
  id: string;
  message: string;
  name?: string;
  picture?: string;
  timeStamp: string; // Ensure it's a string representing a date
}

// interface ResponseMessageType {
//   id: string;
//   isSender: boolean;
//   message: string;
//   timeStamp: string;
// }
export const Inbox: React.FC<InboxType> = ({
  id,
  name,
  image,
  setShowInbox,
  setShowLeftHomePage,
}) => {
  const navigate = useNavigate();
  const inputValue = useRef<HTMLInputElement | null>(null);
  const { userDetails, setVideoCallPage, setUserDetails } =
    useUserDetailsContext();
  const { socketMessage, setSocketMessage } = useSocketMessage();
  const [isOnline, setOnline] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUploadinError, SetImageUploadinError] = useState<string | null>(
    null
  );
  const typingTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [allMessagesToSet, setAllMessagesToSet] = useState<MessageType[]>([
    {
      id: "",
      message: "",
      name: "",
      timeStamp: "",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  const { setProfileMessages, allMessages, setAllMessages } =
    useMessageContext();
  const { socket } = useSocket();
  async function handleGoBack() {
    navigate("/projects/chat-app");
    if (setShowInbox) setShowInbox(false);
    if (setShowLeftHomePage) setShowLeftHomePage(true);
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [allMessagesToSet]);

  useEffect(() => {
    const messagesArray = [];
    if (id) {
      for (const key in allMessages) {
        if (key == id) {
          messagesArray.push(...allMessages[key]);
        }
      }
    }

    messagesArray.sort(
      (a: MessageType, b: MessageType) =>
        new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
    );
    setAllMessagesToSet(messagesArray);
  }, [allMessages]);

  useEffect(() => {
    // Initialize audio element
    notificationSound.current = new Audio("/projects/chat-app//mp3/send.mp3");
    notificationSound.current.load(); // Pre-load the audio

    const isOnlineTimer = setInterval(() => {
      socket?.send(
        JSON.stringify({
          type: "is:online",
          sendTo: id?.toString(),
          user_id: userDetails.user_id.toString(),
        })
      );
    }, 5000);

    return () => {
      clearTimeout(isOnlineTimer);
    };
  }, []);

  useEffect(() => {
    const messageData = socketMessage.message;
    if (messageData.type === "receive") {
      const messagesToSave: MessageType = {
        id: messageData.from,
        message: messageData.message,
        picture:
          messageData.picture?.length < 2 || messageData.picture == undefined
            ? ""
            : messageData.picture,
        name: name || "",
        timeStamp: messageData.timestamp,
      };

      setAllMessages((prev) => {
        const newState = { ...prev };
        if (messagesToSave.id && newState[id || ""]) {
          newState[id || ""] = [...newState[id || ""], messagesToSave];
        } else if (id) {
          newState[id] = [messagesToSave];
        }
        return newState;
      });

      setAllMessages((prev) => {
        const newState = { ...prev };

        for (const key in newState) {
          // Assuming the message objects have a 'timeStamp' property
          newState[key] = newState[key].sort((a, b) => {
            const dateA = new Date(a.timeStamp);
            const dateB = new Date(b.timeStamp);
            return dateB.getTime() - dateA.getTime(); // Sort in descending order
          });
        }

        return newState;
      });

      setProfileMessages((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              message: messageData.message,
              timeStamp: new Date().toISOString(),
            };
          }
          return item;
        })
      );
    }
    // else if (messageData.type === "reject") {
    //   console.log("message received");
    //   setVideoCallPage({ videoCall: false, rest: true });
    // }
    else if (messageData.type == "online:status") {
      console.log(messageData.isOnline);
      if (messageData.isOnline == "online") {
        setOnline(true);
      } else if (messageData.isOnline == "offline") {
        setOnline(false);
      }
    } else if (messageData.type == "user:typing") {
      clearTimeout(typingTimeoutId.current!);
      setIsTyping(true);
      typingTimeoutId.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
    return () => {
      setSocketMessage({ message: "" });
    };
  }, [socketMessage.message]);

  const playNotificationSound = async () => {
    try {
      if (notificationSound.current) {
        // Reset the audio to the beginning
        notificationSound.current.currentTime = 0;
        await notificationSound.current.play();
      }
    } catch (error) {
      console.log(
        "Notification sound failed to play - user may need to interact with the page first"
      );
    }
  };

  async function handleOnSend() {
    console.log("handleOnSend");
    const inputElement = inputValue.current;
    if (!inputElement?.value) return;

    const messageValue = inputElement.value;

    try {
      const response = await fetch(
        `/projects/chat-app/api/v1/search/user/send/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: `${import.meta.env.VITE_APP_ORIGIN}`,
          },
          body: JSON.stringify({
            type: "send",
            message: messageValue,
            recieverId: id,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to send message");
      if (response.ok) {
        // Creating a new message object
        const newMessage: MessageType = {
          id: userDetails.user_id, // Your user's ID
          message: messageValue, // The message content
          name: userDetails.name || "", // The sender's name
          timeStamp: new Date().toISOString(), // Current timestamp in ISO format
        };

        // setProfileMessages((prev) =>
        //   prev.map((item) => {
        //     if (item.id === id) {
        //       return {
        //         ...item,
        //         message: messageValue,
        //         timeStamp: new Date().toISOString(),
        //       };
        //     }
        //     return item;
        //   })
        // );
        setProfileMessages((prev) => {
          const existingItem = prev.find((item) => item.id === id);

          if (existingItem) {
            // Update the existing message
            return prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    message: messageValue,
                    timeStamp: new Date().toISOString(),
                  }
                : item
            );
          } else {
            // Add the new message if it doesn't exist
            return [
              ...prev,
              {
                id: id || "",
                message: messageValue,
                name: name || "",
                picture: image || "", // Ensure 'picture' is included
                timeStamp: new Date().toISOString(),
              },
            ];
          }
        });

        // setAllMessagesToSet((prev = []) => [...prev, newMessage]);

        setAllMessages((prev) => {
          const newState = { ...prev }; // Create a copy of the previous state
          if (id && newState[id]) {
            // Check if the conversation thread exists
            newState[id] = [...newState[id], newMessage]; // Add new message to the thread
          } else if (id) {
            newState[id] = [newMessage]; // Create a new thread if it doesn't exist
          }
          return newState;
        });
        console.log("after send message: ", allMessages);
        if (socket)
          socket.send(
            JSON.stringify({
              type: "send",
              name: userDetails.name,
              sendTo: id,
              message: messageValue,
              // picture: userDetails.image,
            })
          );
        playNotificationSound();
      }
      // else if(response.status == 403){
      //   Cookies.remove("__authToken")
      // }
      const data = await response.json();
      const userInfo = Cookies.get("userInfo");
      if (!userInfo) throw new Error("User info not found");

      const parsedData = JSON.parse(userInfo);
      const messagesArr: MessageType[] = parsedData.messages || [];

      const newMsg: MessageType = {
        id: id || "",
        message: messageValue,
        name: name || "",
        picture: image || "",
        timeStamp: new Date().toISOString(),
      };

      const updatedMessages = [newMsg, ...messagesArr]
        .sort(
          (a, b) =>
            new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
        )
        .filter(
          (message, index, self) =>
            index === self.findIndex((t) => t.id === message.id)
        );

      const updatedUserInfo = {
        ...parsedData,
        messages: updatedMessages,
      };

      Cookies.set("userInfo", JSON.stringify(updatedUserInfo));
      console.log(data);

      // Clear the input after sending the message
      inputElement.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
      // Here you might want to show an error message to the user
    }
  }
  async function handleOnSendWithImage() {
    console.log("handleOnSendWithImage");
    if (!imageFile) return;

    // Clear previous error
    SetImageUploadinError(null);

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(
        `/projects/chat-app/api/v1/search/user/send/image`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (!response.ok) {
        setIsUploading(false);
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      setIsUploading(false);
      const data = await response.json();
      if (data.url) {
        const messageText = inputValue.current?.value || " ";
        const messageData = {
          type: "send",
          message: messageText,
          image: data.url, // Only pass the image URL, not the full image file object
          recieverId: id,
        };

        // Make sure to log the data to check for circular structures
        console.log("Sending message data:", messageData);
        // Send the message with the image URL
        const messageResponse = await fetch(
          `/projects/chat-app/api/v1/search/user/send/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Origin: `${import.meta.env.VITE_APP_ORIGIN}`,
            },
            body: JSON.stringify(messageData),
            credentials: "include",
          }
        );
        if (messageResponse.ok) {
          // const data = await messageResponse.json()

          const newMessage: MessageType = {
            id: userDetails.user_id, // Your user's ID
            message: inputValue.current?.value ? inputValue.current.value : "", // The message content
            picture: data.url,
            name: userDetails.name || "", // The sender's name
            timeStamp: new Date().toISOString(), // Current timestamp in ISO format
          };
          setAllMessages((prev) => {
            const newState = { ...prev }; // Create a copy of the previous state
            if (id && newState[id]) {
              // Check if the conversation thread exists
              newState[id] = [...newState[id], newMessage]; // Add new message to the thread
            } else if (id) {
              newState[id] = [newMessage]; // Create a new thread if it doesn't exist
            }
            return newState;
          });
          socket?.send(
            JSON.stringify({
              type: "send",
              name: userDetails.name,
              sendTo: id,
              message: inputValue.current?.value,
              picture: data.url,
            })
          );
          if (inputValue.current) inputValue.current.value = "";
          setImageFile(null);
          playNotificationSound();
        }
      }
      // console.log(data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }
  function handleVideoCall() {
    if (setVideoCallPage)
      setVideoCallPage({ callerVideo: true, answerVideo: false, rest: false });
    //  if(socket) socket.send(JSON.stringify({type:"video-call", name:userDetails.name, callTo:id?.toString() , user_id:userDetails.user_id}))
    setUserDetails((prev) => {
      return {
        ...prev,
        incomingCall: {
          ...prev.incomingCall, // Preserve any existing properties
          id: id?.toString() || "",
          name: name || "",
          setVideoCallPage: prev.incomingCall.setVideoCallPage, // Preserve the setVideoCallPage function
        },
      };
    });
  }

  function handleTyping() {
    // Clear any existing timeout to debounce
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // set a new timeout
    typingTimeout.current = setTimeout(() => {
      socket?.send(
        JSON.stringify({ type: "user:typing", sendTo: id?.toString() })
      );
    }, 500);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Enter") {
      if (imageFile) {
        handleOnSendWithImage()
      }else{
        handleOnSend();
      }
    }
  }

  useEffect(() => {
    console.log(imageUploadinError);
  }, [imageUploadinError]);
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      // Validate File Size
      const maxSize = 5 * 1024 * 1024; // converting to bytes

      if (e.target.files[0].size > maxSize) {
        SetImageUploadinError(`File size must be less than 5MB`);
        e.target.value = "";
        return;
      } else {
        setImageFile(e.target.files[0]);
      }
    }
  }
  function handleIconClick() {
    document.getElementById("fileInput")?.click();
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1A1D23] text-[#F7F7F7] ">
  {/* Header */}
  <div className="flex items-center p-2 sm:p-4 shadow bg-[#33373D] text-[#B1B5C3]">
    <IoMdArrowRoundBack
      onClick={handleGoBack}
      size={24}
      className="cursor-pointer hover:text-[#34C759] transition-colors"
    />
    <img
      src={image}
      alt={`${name}'s profile`}
      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ml-2 sm:ml-4"
    />
    <div className="ml-2 sm:ml-4 flex flex-col">
      <h1 className="text-base sm:text-lg font-semibold text-[#F7F7F7]">
        {name}
      </h1>
      {isOnline && (
        <div className="flex items-center mt-1">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="absolute h-full w-full rounded-full bg-[#34C759] opacity-75 animate-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34C759]"></span>
          </span>
          <span className="text-xs sm:text-sm text-[#B1B5C3]">online</span>
        </div>
      )}
    </div>
    <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
      <FaVideo
        onClick={handleVideoCall}
        className="cursor-pointer hover:text-[#4C9EEB] transition-colors text-[#B1B5C3]"
      />
      <CiMenuKebab className="cursor-pointer hover:text-[#4C9EEB] transition-colors text-[#B1B5C3]" />
    </div>
  </div>

  {/* Chat area */}
  <div className="flex-grow p-2 sm:p-4 overflow-y-auto bg-[#1A1D23]">
    {allMessagesToSet?.length ? (
      allMessagesToSet.map((item) => (
        <div
          key={`${item.id}-${item.timeStamp}`}
          className={`flex ${
            item.id === userDetails.user_id
              ? "justify-end"
              : "justify-start"
          } mb-2`}
        >
          <div
            className={`${
              item.id === userDetails.user_id
                ? "bg-[#4C9EEB] text-[#F7F7F7]"
                : "bg-[#33373D] text-[#B1B5C3]"
            } p-2 sm:p-3 rounded-lg max-w-[75%] sm:max-w-[70%] md:max-w-[60%] break-words`}
          >
            <span className="font-semibold text-xs sm:text-sm">
              {item.name}
            </span>
            {item.picture && <img src={item.picture} />}
            <div className="text-xs sm:text-sm whitespace-pre-wrap">
              {item.message}
            </div>
            <span className="text-[10px] sm:text-xs text-right block mt-1 opacity-90 text-[#B1B5C3]">
              {new Date(item.timeStamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-[#B1B5C3] text-sm">No messages yet.</p>
    )}
    <div ref={chatEndRef} />
    {isTyping && (
      <div className="flex justify-start mb-2">
        <div className="typing bg-[#33373D] rounded-lg p-2 flex items-center">
          <div className="dot bg-[#4C9EEB] w-1.5 h-1.5 rounded-full mr-1 animate-pulse"></div>
          <div className="dot bg-[#4C9EEB] w-1.5 h-1.5 rounded-full mr-1 animate-pulse"></div>
          <div className="dot bg-[#4C9EEB] w-1.5 h-1.5 rounded-full animate-pulse"></div>
        </div>
      </div>
    )}
  </div>

  {/* Message input area */}
  <div className="p-2 sm:p-4 flex items-center border-t bg-[#33373D] gap-x-2">
    <input
      id="fileInput"
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="hidden"
      disabled={isUploading}
    />
    <div className="flex items-center min-w-fit relative">
      <FaPaperclip
        onClick={handleIconClick}
        className="text-[#B1B5C3] cursor-pointer hover:text-[#4C9EEB] transition-colors"
        size={18}
      />
      {imageFile && (
        <span className="absolute top-0 right-0 bg-[#4C9EEB] text-[#F7F7F7] rounded-full text-[10px] sm:text-xs px-1">
          1
        </span>
      )}
      {isUploading && (
        <span className="text-[10px] sm:text-xs text-[#B1B5C3] ml-1">
          Uploading...
        </span>
      )}
    </div>

    <div className="flex-1 flex items-center gap-x-2">
      <input
        type="text"
        ref={inputValue}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="w-full min-w-0 px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4C9EEB] text-xs sm:text-sm text-[#232222]"
      />
      <button
        onClick={() => {
          if (imageFile) {
            handleOnSendWithImage();
          } else {
            handleOnSend();
          }
        }}
        className="p-1.5 sm:p-2 bg-[#4C9EEB] text-[#F7F7F7] rounded-full hover:bg-[#3B7DD4] transition-colors flex-shrink-0"
      >
        <IoMdSend size={18} />
      </button>
    </div>
  </div>
</div>
  );
};
