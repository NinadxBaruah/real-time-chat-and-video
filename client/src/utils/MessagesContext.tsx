import { createContext, useState, ReactNode, useContext, SetStateAction, useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "./AuthContext";


interface MessageType {
  id: string;
  message: string;
  picture?: string;
  name?:string;
  timeStamp: string;
}
interface RecieveMessageType {
  id: string;
  message: string;
  picture?:string;
  senderName:string;
  timeStamp: string;
}
interface MessagesContextProp {
  children: ReactNode;
}

interface profileMessagesType {
  id: string;
  message: string;
  name: string;
  picture: string;
  timeStamp: string;
}

interface MessageContextType {
  allMessages: {
    [key: string]: MessageType[];
  };
  profileMessages: profileMessagesType[];
  fetchAllMessages: (id: string, name: string) => Promise<void>;
  fetchAllProfileMessages: () => void
  setProfileMessages:React.Dispatch<SetStateAction<profileMessagesType[]>>
  setAllMessages:React.Dispatch<SetStateAction<{
    [key: string]: MessageType[];
  }>>
}

const MessageContext = createContext<MessageContextType>({
  allMessages: {},
  profileMessages: [],
  fetchAllMessages: async () => {},
  fetchAllProfileMessages: async () => {},
  setProfileMessages: () => {},
  setAllMessages:() => {}
});

export const MessagesContext = ({ children }: MessagesContextProp) => {
  const [allMessages, setAllMessages] = useState<{
    [key: string]: MessageType[];
  }>({});

  const [profileMessages, setProfileMessages] = useState<profileMessagesType[]>(
    []
  );

  useEffect(() =>{
    console.log(allMessages)
  },[allMessages])
  const {setIsLoggedIn} = useAuth()
  const fetchAllProfileMessages = async () => {
    const hasFetchedFriendRequests = sessionStorage.getItem("___userMessages");
    if(!hasFetchedFriendRequests)
    {
        try {
            const messagesRes = await fetch(
              `/projects/chat-app/api/v1/search/user/send/message`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
                },
                body: JSON.stringify({
                  type: "allMessages",
                }),
                credentials: "include",
              }
            );
            if (messagesRes.ok) {
              const data = await messagesRes.json();
              const messagesIds = data.mergedData.map((item: profileMessagesType) => {
                return { id: item.id.toString(), name: item.name };
              });
              setProfileMessages((prev) => [...prev, ...data.mergedData]);
              for (const element of messagesIds) {
                await fetchAllMessages(element.id, element.name);
              }

            const userInfo = Cookies.get("userInfo");
              if (userInfo) {
                const userData = JSON.parse(userInfo);
                const newUSerData = {
                  ...userData,
                  messages: data.mergedData,
                };
  
                Cookies.set("userInfo", JSON.stringify(newUSerData), {
                  expires: 1,
                });
              }
              sessionStorage.setItem("___userMessages" , 'true');
            }
            // else if(messagesRes.status == 403){
            //   Cookies.remove("__authToken")
            //   setIsLoggedIn(false)
            // }
          } catch (err) {
            console.log(err);
          }
    }

  };

  const fetchAllMessages = async (id: string, name: string) => {
    try {
      const response = await fetch(
        `/projects/chat-app/api/v1/search/user/get/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
          },
          body: JSON.stringify({ reciever: id }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const messagesFromData = data.messagesData;
        const messagesToSave = messagesFromData.map((item: RecieveMessageType) => {
          return {
            id: item.id,
            message: item.message,
            picture:item.picture,
            name: item.senderName,
            timeStamp: item.timeStamp,
          };
        });
        setAllMessages((prev) => ({
          ...prev,
          [id]: [...messagesToSave],
        }));
        console.log(data)
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MessageContext.Provider
      value={{ allMessages, fetchAllMessages, profileMessages , fetchAllProfileMessages ,setProfileMessages , setAllMessages}}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  return useContext(MessageContext);
};
