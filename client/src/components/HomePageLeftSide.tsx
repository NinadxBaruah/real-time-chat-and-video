import React, { useEffect, useState, useRef } from "react";
import { CiMenuFries } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { Menu } from "./Menu";
import { Messages } from "./Messages";
import { LoginButton } from "./LoginButton";
import { SearchBox } from "./SearchBox";
import SearchUser from "./SearchUser";
import { IoIosAddCircle } from "react-icons/io";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useMessageContext } from "../utils/MessagesContext";
import { useSocket } from "../utils/useSocket";
import Cookies from "js-cookie";
import IncomingCall from "./IncomingCall";
import { useSocketMessage } from "../utils/SocketMessageContext";

interface MenuItemTypes {
  profile: boolean;
  addFriends: boolean;
  notifications: boolean;
}
interface VideoCallType {
  callerVideo:boolean;
  answerVideo: boolean;
  rest: boolean;
}


interface HomePageLeftSideProps {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  showAddUser: boolean;
  setShowAddUser: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMenuItems: React.Dispatch<React.SetStateAction<MenuItemTypes>>;
  setShowLeftHomePage: React.Dispatch<React.SetStateAction<boolean>>;
  handleInbox: (id: string, name: string, image: string) => Promise<void>;
  setShowIncomingCall : React.Dispatch<React.SetStateAction<boolean>>;
  setVideoCallPage: React.Dispatch<React.SetStateAction<VideoCallType>>
}

interface MessagesType {
  id: string;
  message: string;
  name: string;
  picture: string;
  timeStamp: string;
}

interface profileMessagesType {
  id: string;
  message: string;
  name: string;
  sender?: string;
  picture: string;
  timeStamp: string;
}

export const HomePageLeftSide: React.FC<HomePageLeftSideProps> = ({
  showMenu,
  setShowMenu,
  isLoggedIn,
  showAddUser,
  setShowAddUser,
  setShowMenuItems,
  setShowLeftHomePage,
  handleInbox,
  setShowIncomingCall,
  setVideoCallPage
}) => {
  const { fetchUserData, fetchFriendRequests ,setUserDetails } = useUserDetailsContext();
  const [messages, setMessages] = useState<MessagesType[] | null>(null);
  const [newMessage , setNewMessage] = useState(false)
  const [newMessageIds, setNewMessageIds] = useState<string[]>([]);
  const {socketMessage ,setSocketMessage} = useSocketMessage();
  const {
    setAllMessages,
    setProfileMessages,
    profileMessages,
    fetchAllProfileMessages,
  } = useMessageContext();

  // Create a ref for the audio element
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    notificationSound.current = new Audio("/projects/chat-app/mp3/recieve.mp3");
    notificationSound.current.load(); // Pre-load the audio
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      await fetchFriendRequests();
    };
    setTimeout(() =>{
      fetchData();
      fetchAllProfileMessages();
    },1000)
  }, []);


  useEffect(() => {
    if (profileMessages) {
      const sortedMessages = profileMessages.sort((a, b) => {
        return (
          new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
        );
      });
      setMessages(sortedMessages);
    }
  }, [profileMessages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("___userMessages");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Helper function to play notification sound
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

  useEffect(() =>{
    const messageData = socketMessage.message;
        if (messageData.type === "receive") {
        const messagesToSave: profileMessagesType= {
          id: messageData.from,
          message: messageData.message,
          sender: messageData.sender,
          name: messageData.name,
          timeStamp: messageData.timestamp,
          picture:messageData.picture
        };

        setAllMessages((prev) => {
          const newState = { ...prev };
          if (messagesToSave.id && newState[messageData.from || ""]) {
            newState[messageData.from || ""] = [
              ...newState[messageData.from || ""],
              messagesToSave,
            ];
          } else if (messageData.from) {
            newState[messageData.from] = [messagesToSave];
          }
          return newState;
        });

        setNewMessageIds((prevIds) => [...prevIds, messageData.from]);


        setAllMessages((prev) => {
          const newState = { ...prev };
          for (const key in newState) {
            newState[key] = newState[key].sort((a, b) => {
              const dateA = new Date(a.timeStamp);
              const dateB = new Date(b.timeStamp);
              return dateB.getTime() - dateA.getTime();
            });
          }
          return newState;
        });

        setProfileMessages((prev) =>
          prev.map((item) => {
            if (item.id === messageData.from) {
              return {
                ...item,
                message: messageData.message,
                timeStamp: new Date().toISOString(),
              };
            }
            return item;
          })
        );

        // Check if message already exists
        const messageExists = profileMessages.some(
          (item) => item.id === messagesToSave.id
        );

        // Only add the message if it doesn't exist
        if (!messageExists) {
          setProfileMessages((prev) => {
            // Create a new array with the new message at the beginning
            const updatedMessages = [messagesToSave, ...prev];

            // Sort messages by timestamp if needed
            return updatedMessages.sort(
              (a, b) =>
                new Date(b.timeStamp).getTime() -
                new Date(a.timeStamp).getTime()
            );
          });
        }

        // Play notification sound
        playNotificationSound();
      }

      // else if(messageData.type == "video-call") {
      //   console.log(messageData.from)
      //   setUserDetails((prev) =>{
      //     return {...prev, incomingCall: {id:messageData.from , name:messageData.name}}
      //   })
      //   setShowIncomingCall(true);
      // }


      return () =>{
        setSocketMessage({message:''})
      }
  },[socketMessage.message])


  return (
    <div>
      {!showMenu ? (
        <CiMenuFries
          size={25}
          className="ml-2 mt-2 cursor-pointer"
          onClick={() => setShowMenu((prev) => !prev)}
        />
      ) : (
        <IoMdClose
          size={25}
          className="ml-2 mt-2 cursor-pointer"
          onClick={() => setShowMenu((prev) => !prev)}
        />
      )}

      {showMenu && (
        <Menu
          setShowMenuItems={setShowMenuItems}
          setShowMenu={setShowMenu}
          setShowLeftHomePage={setShowLeftHomePage}
        />
      )}
      <SearchBox />
      {isLoggedIn ? (
        messages?.map((message) => {
          return (
            <Messages
              key={message.id}
              id={message.id}
              message={message.message}
              name={message.name}
              picture={message.picture}
              timeStamp={message.timeStamp}
              handleInbox={handleInbox}
              isNewMessage={newMessageIds.includes(message.id)}
            />
          );
        })
      ) : (
        <LoginButton />
      )}
      {showAddUser && (
        <SearchUser
          showAddUser={showAddUser}
          setShowAddUser={setShowAddUser}
          setShowLeftHomePage={setShowLeftHomePage}
          handleInboxes={handleInbox}
        />
      )}
      {isLoggedIn && (
        <IoIosAddCircle
          size={50}
          className="absolute bottom-0 right-0 mb-10 mr-10 cursor-pointer"
          onClick={() => setShowAddUser((prev) => !prev)}
        />
      )}
    </div>
  );
};
