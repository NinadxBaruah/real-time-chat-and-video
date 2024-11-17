import React from "react";
import { useAuth } from "../utils/AuthContext";
import { useUserDetailsContext } from "../utils/UserDetailsContext";

interface MenuItemTypes {
  profile: boolean;
  addFriends: boolean;
  notifications: boolean;
}


interface MenuProps {
  setShowMenuItems: React.Dispatch<React.SetStateAction<MenuItemTypes>>;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLeftHomePage: React.Dispatch<React.SetStateAction<boolean>>;
}


export const Menu: React.FC<MenuProps> = ({
  setShowMenuItems,
  setShowMenu,
  setShowLeftHomePage
}) => {
  const { logout } = useAuth();
  const { userDetails } =
    useUserDetailsContext();

  // const [friendRequests, setFriendRequets] = useState<FriendRequestSender[]>([]);

  // useEffect(() => {
  //   setFriendRequets(userDetails.FriendRequestSenders);
  // }, [userDetails.FriendRequestSenders]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     await fetchUserData();
  //     await fetchFriendRequests();
  //     // setIsLoading(false);
  //     // return () =>{
  //     //   sessionStorage.clear();
  //     // }
  //   };

  //   fetchData();
  // }, []);

  return (
<>
  <div className="flex flex-col select-none absolute z-20 bg-[#33373D] border border-[#4C9EEB] shadow-lg rounded-lg w-[40%] top-12 left-2 text-[#F7F7F7]">
    <span
      className="px-4 py-3 cursor-pointer hover:bg-[#1A1D23] font-medium text-[#B1B5C3] hover:text-[#4C9EEB] transition-all duration-200"
      onClick={() => {
        setShowMenu(false);
        setShowMenuItems((prevState) => ({
          ...prevState,
          profile: true,
          addFriends: false,
          notifications: false
        }));
        setShowLeftHomePage(false)
      }}
    >
      Profile
    </span>
    <span
      className="px-4 py-3 cursor-pointer hover:bg-[#1A1D23] font-medium text-[#B1B5C3] hover:text-[#4C9EEB] transition-all duration-200"
      onClick={() => {
        setShowMenu(false);
        setShowMenuItems((prevState) => ({
          ...prevState,
          profile: false,
          addFriends: true,
          notifications: false
        }));
        setShowLeftHomePage(false)
      }}
    >
      Add Friends
    </span>
    <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#1A1D23] font-medium text-[#B1B5C3] hover:text-[#4C9EEB] transition-all duration-200">
      <span
        onClick={() => {
          setShowMenu(false);
          setShowMenuItems({
            profile: false,
            addFriends: false,
            notifications: true,
          });
          setShowLeftHomePage(false)
        }}
      >
        Notifications
      </span>
      {userDetails.FriendRequestSenders?.length ? (
        <span className="bg-[#34C759] text-[#F7F7F7] text-xs font-bold py-1 px-[0.6rem] rounded-full">
          {userDetails.FriendRequestSenders.length}
        </span>
      ) : (
        <span className="text-[#B1B5C3] text-xs font-bold">0</span>
      )}
    </div>
    <span
      onClick={() => {
        setShowMenu(false);
        logout();
      }}
      className="px-4 py-3 cursor-pointer hover:bg-[#1A1D23] font-medium text-[#4C9EEB] transition-all duration-200"
    >
      Logout
    </span>
  </div>
</>
  );
};
