import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { HomePageLeftSide } from "./HomePageLeftSide";
import { Profile } from "./Profile";
import { AddFriends } from "./AddFriends";
import { Notifications } from "./Notifications";
import { Inbox } from "./Inbox";
import IncomingCall from "./IncomingCall";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useSocketMessage } from "../utils/SocketMessageContext";
import { CallerVideo } from "./CallerVideo";
import { AnswerVideo } from "./AnswerVideo";
import chatAppBg from '../../public/images/chatApp-bg.jpeg';

interface MenuItemTypes {
  profile: boolean;
  addFriends: boolean;
  notifications: boolean;
}
interface InboxType {
  id?: string;
  name?: string;
  image?: string;
}
interface VideoCallType {
  videoCall: boolean;
  rest: boolean;
}
export function HomePage() {
  const { isLoggedIn, MenuRemove } = useAuth();
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showLeftHomePage, setShowLeftHomePage] = useState(true);
  const [showInbox, setShowInbox] = useState(false);
  const [inboxItems, setInboxItems] = useState<InboxType>({});
  const { socketMessage } = useSocketMessage();
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [inboxPosition , setInboxPosition] = useState<string>("right")
  const {
    setUserDetails,
    userDetails,
    videoCallPage,
    setVideoCallPage,
    showIncomingCall,
    setShowIncomingCall,
  } = useUserDetailsContext();

  const [showMenuItems, setShowMenuItems] = useState<MenuItemTypes>({
    profile: false,
    addFriends: false,
    notifications: false,
  });
  window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem("friendRequestsFetched");
    sessionStorage.removeItem("__userMessages");
    sessionStorage.removeItem("__friendList");
  });
  async function handleInbox(id: string, name: string, image: string) {
    setInboxItems({
      id: id,
      name: name,
      image: image,
    });
    if(inboxPosition == "left"){

      setShowLeftHomePage(false);
    }
    setShowInbox(true);
  }

  useEffect(() => {
    // Handler to update window width
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() =>{
    if(windowWidth > 768){
      setInboxPosition("right")
      if(showInbox == true){
        setShowLeftHomePage(true)
      }
    }
    else{
      setInboxPosition("left")
      if(showInbox == true){
        setShowLeftHomePage(false)
      }
    }
  },[windowWidth])

  useEffect(() => {
    const messageData = socketMessage.message;

    if (messageData.type == "video-call") {
      console.log(messageData.from);
      setUserDetails((prev) => {
        return {
          ...prev,
          incomingCall: { ...prev.incomingCall, id: messageData.from, name: messageData.name },
        };
      });
      setShowIncomingCall(true);
    }

    // if(messageData.type == "call-ended") {
    //   console.log("call-ended call")
    //   setShowIncomingCall(false);
    //   setVideoCallPage({videoCall:false , rest:true});
    // }
  }, [socketMessage.message]);
  // useEffect(() => {
  //   const userDetail  = userDetails;
  //   const videoCallPage = setVideoCallPage
  //   MenuRemove(setShowMenu);
  //   setUserDetails((prev) =>{
  //     return {...prev , incomingCall:{id:userDetail.incomingCall.id , name: userDetail.incomingCall.name , setVideoCallPage:videoCallPage}}
  //   })
  // }, []);

  // In your HomePage component, add this useEffect
  useEffect(() => {
    const updateContextWithVideoCallSetter = () => {
      setUserDetails((prev) => ({
        ...prev,
        incomingCall: {
          ...prev.incomingCall,
          setVideoCallPage: setVideoCallPage,
        },
      }));
    };

    updateContextWithVideoCallSetter();
  }, [setVideoCallPage]); // Add setVideoCallPage as a dependency

  return (
    <div className="w-full flex bg-[#2F343A] text-[#F7F7F7]">
    {showIncomingCall && (
      <IncomingCall  />
    )}
    <div className="bg-[#33373D] rounded-lg">
      {videoCallPage.callerVideo && (
        <CallerVideo />
      )}
      {videoCallPage.answerVideo && (
        <AnswerVideo  />
      )}
    </div>
    {videoCallPage.rest && (
      <div className="w-full h-[100dvh] relative md:w-[40%] md:max-h-[100vh] scrollbar-hidden hover:scrollbar-auto md:overflow-y-auto bg-[#1A1D23] rounded-lg">
        {showMenuItems.profile && (
          <div>
            <Profile
              setShowMenuItems={setShowMenuItems}
              setShowLeftHomePage={setShowLeftHomePage}
              // className="text-[#B1B5C3] hover:text-[#34C759] transition-colors duration-200"
            />
          </div>
        )}
        {showMenuItems.addFriends && (
          <AddFriends
            setShowMenuItems={setShowMenuItems}
            setShowLeftHomePage={setShowLeftHomePage}
            // className="text-[#B1B5C3] hover:text-[#4C9EEB] transition-colors duration-200"
          />
        )}
        {showMenuItems.notifications && (
          <Notifications
            setShowMenuItems={setShowMenuItems}
            setShowLeftHomePage={setShowLeftHomePage}
            // className="text-[#B1B5C3] hover:text-[#4C9EEB] transition-colors duration-200"
          />
        )}
        {inboxPosition == "left" && showInbox && (
          <Inbox
            id={inboxItems?.id}
            name={inboxItems?.name}
            image={inboxItems?.image}
            setShowLeftHomePage={setShowLeftHomePage}
            setShowInbox={setShowInbox}
            // className="bg-[#33373D] rounded-lg text-[#F7F7F7]"
          />
        )}
        {showLeftHomePage &&
          !showMenuItems.profile &&
          !showMenuItems.addFriends &&
          !showMenuItems.notifications && (
            <HomePageLeftSide
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              isLoggedIn={isLoggedIn}
              showAddUser={showAddUser}
              setShowAddUser={setShowAddUser}
              setShowMenuItems={setShowMenuItems}
              setShowLeftHomePage={setShowLeftHomePage}
              handleInbox={handleInbox}
              setShowIncomingCall={setShowIncomingCall}
              setVideoCallPage={setVideoCallPage}
              // className="text-[#B1B5C3] hover:text-[#34C759] transition-colors duration-200"
            />
          )}
      </div>
    )}
  
  <div className="hidden md:block md:w-[60%] md:h-screen rounded-lg border-l border-[#4C9EEB] bg-gradient-to-r from-[#2C343F] to-[#1A1D23] bg-opacity-90 bg-blend-overlay">
  <div className="bg-cover bg-center h-full w-full" style={{ backgroundImage: `url(${chatAppBg})` }}>
    {inboxPosition == "right" && showInbox && (
      <Inbox
        id={inboxItems?.id}
        name={inboxItems?.name}
        image={inboxItems?.image}
        setShowLeftHomePage={setShowLeftHomePage}
        setShowInbox={setShowInbox}
        // className="p-4 text-[#F7F7F7] drop-shadow-lg"
      />
    )}
  </div>
</div>
  </div>
  );
}
