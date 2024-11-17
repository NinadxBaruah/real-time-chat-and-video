import { useContext, createContext, useState, SetStateAction } from "react";
import Cookies from "js-cookie";
import { useAuth } from "./AuthContext";

interface FriendRequestSender {
  id: string;
  name: string;
  image: string;
}

interface Friend {
  id: string;
  name: string;
  bio?: string;
  image: string;
}
interface MessagesType {
  id: string;
  message: string;
  name: string;
  picture: string;
  timeStamp: string;
}

interface VideoCallType {
  callerVideo: boolean;
  answerVideo: boolean;
  rest: boolean;
}

interface UserDetails {
  user_id: string;
  name: string;
  image: string;
  bio?: string;
  FriendRequestSenders: FriendRequestSender[];
  friendsList: Friend[];
  messages: MessagesType[];
  incomingCall: {  id: string;
    name: string; setVideoCallPage?:React.Dispatch<React.SetStateAction<VideoCallType>> | undefined ,type:string}
}
interface UserContextType {
  userDetails: UserDetails;
  fetchUserData: () => Promise<void>;
  setBio: (bio: string) => void;
  fetchFriendRequests: () => Promise<void>;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails>>;
  videoCallPage: VideoCallType;
  setVideoCallPage: React.Dispatch<React.SetStateAction<VideoCallType>>;
  showIncomingCall:boolean;
  setShowIncomingCall:React.Dispatch<React.SetStateAction<boolean>>
}

interface UserDetailsProp {
  children: React.ReactNode;
}

const UserDetailsContext = createContext<UserContextType>({
  userDetails: {
    user_id: "",
    name: "",
    image: "",
    bio: "",
    FriendRequestSenders: [],
    friendsList: [],
    messages: [],
    incomingCall: { id: '', name: '' ,type:''},
  },
  fetchUserData: async () => {},
  setBio: (bio: string) => {},
  fetchFriendRequests: async () => {},
  setUserDetails: () => {},
  videoCallPage: { callerVideo: false, answerVideo:false, rest: true },
  setVideoCallPage: () => {},
  showIncomingCall: false,
  setShowIncomingCall: () => {}
});

export const UserDetailsProvider = ({ children }: UserDetailsProp) => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    user_id: "",
    name: "",
    image: "",
    bio: "",
    FriendRequestSenders: [],
    friendsList: [],
    messages: [],
    incomingCall: { id: '', name: '',type:'' }
  });

  const [videoCallPage, setVideoCallPage] = useState<VideoCallType>({
    callerVideo: false,
    answerVideo:false,
    rest: true,
  });

  const [showIncomingCall , setShowIncomingCall] = useState<boolean>(false);
  const fetchUserData = async () => {
    // Fetch user data if not already present
    const isFriendList = sessionStorage.getItem("__friendList");
    // const data: string | undefined = Cookies.get("userInfo");
    if (!isFriendList) {
      try {
        console.log("making api rq to fecth user data");
        const response = await fetch(
          `/projects/chat-app/api/v1/search/user/profile`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              'Content-Type': 'application/json',
              'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          console.log(userData);
          Cookies.set("userInfo", JSON.stringify(userData), { expires: 1 });
          setUserDetails((prev) => ({
            ...prev,
            user_id: userData.id,
            name: userData.name,
            image: userData.image,
            bio: userData?.bio,
            friendsList: userData.friendsList || [],
          }));
          sessionStorage.setItem("__friendList", "true");
        }
        // else if(!response.ok){
        //   Cookies.remove("__authToken")
        //   setIsLoggedIn(false)
        // }
        else {
          console.log("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else if (isFriendList) {
      const data: string | undefined = Cookies.get("userInfo");
      if (data) {
        const userInfo = JSON.parse(data);
        setUserDetails({
          user_id: userInfo.id,
          name: userInfo.name,
          image: userInfo.image,
          bio: userInfo?.bio,
          friendsList: userInfo.friendsList || [],
          FriendRequestSenders: userInfo?.FriendRequestSenders || [],
          messages: userInfo?.messages || null,
          incomingCall:{id:'' , name:'', type:'', setVideoCallPage: () => {}}
        });
      }
    } else {
      console.log("User details already present");
    }
  };



  const fetchFriendRequests = async () => {
    const hasFetchedFriendRequests = sessionStorage.getItem(
      "friendRequestsFetched"
    );
    // sessionStorage.removeItem("friendRequestsFetched");
    if (hasFetchedFriendRequests) {
      console.log(
        "Friend requests have already been fetched for this session."
      );
      return; // Exit early if the data has already been fetched in this session
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/projects/chat-app/api/v1/search/user/friend-requests`,
        {
          method: "POST",
          credentials: "include",
          headers:{
            "Content-Type": "application/json",
            'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserDetails((prev) => ({
          ...prev,
          FriendRequestSenders: data.senderInfos,
        }));
        // console.log("from here:",data);

        // Set session storage flag to prevent further API calls during the same session
        sessionStorage.setItem("friendRequestsFetched", "true");
      } 
      // else if (response.status == 403 || response.status == 401) {
      //   // setIsLoggedIn(false)
      //   logout();
      // }
    } catch (err) {
      console.log("error while fetching friend reqts", err);
    }
  };

  const setBio = (bio: string) => {
    const dataFromCookie = Cookies.get("userInfo");
    if (dataFromCookie) {
      const UserInfo = JSON.parse(dataFromCookie);
      UserInfo.bio = bio;
      const setUserInfo = JSON.stringify(UserInfo);
      Cookies.set("userInfo", setUserInfo, { expires: 1 });
    }
  };

  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        fetchUserData,
        setBio,
        fetchFriendRequests,
        setUserDetails,
        videoCallPage,
        setVideoCallPage,
        showIncomingCall,
        setShowIncomingCall
        // fetchUserMessages,
      }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetailsContext = () => {
  return useContext(UserDetailsContext);
};
