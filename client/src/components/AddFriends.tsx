import React, { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../utils/useDebounce";
import { useAuth } from "../utils/AuthContext";
import UserCard from "./UserCard";

interface MenuItems {
  profile: boolean;
  addFriends: boolean;
  notifications: boolean;
}
interface addFriendsProps {
  setShowMenuItems?: React.Dispatch<React.SetStateAction<MenuItems>>;
  setShowLeftHomePage?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Users {
  id: string;
  name: string;
  image: string;
  bio: string;
  isFriendRequestSent: boolean;
  status: string;
}

export const AddFriends = ({ setShowMenuItems ,setShowLeftHomePage}: addFriendsProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [users, setUsers] = useState<Users[]>([]);
  const { logout } = useAuth();
  useEffect(() => {
    async function fetchUserData(query: string) {
      try {
        if (query && query.length > 3) {
          const response = await fetch(
            `/projects/chat-app/api/v1/search/user?name=${query}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                'Content-Type': 'application/json',
                'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            const dataToSave = data.user.filter(
              (item: {
                bio: string;
                id: string;
                image: string;
                isFriendRequestSent: string;
                name: string;
                status: string;
              }) => {
                if (item.status == "accept") {
                  return false;
                }
                return true;
              })
            if (data.user.length > 0) setUsers(dataToSave);
          } 
          // else if (response.status == 401) {
          //   logout();
          // }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }

    fetchUserData(debouncedQuery);
  }, [debouncedQuery]);
  const handleGoBack = () => {
    if (setShowMenuItems) {
      setShowMenuItems((prevState) => ({
        ...prevState,
        addFriends: false,
      }));
      if(setShowLeftHomePage) setShowLeftHomePage(true);
    }
    navigate("/projects/chat-app");
  };
  const onRequest = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/projects/chat-app/api/v1/search/user/send/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
          },
          body: JSON.stringify({ recipientId: userId }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error sending request:", err);
      return false;
    }
  };

  const OnUnSend = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/projects/chat-app/api/v1/search/user/send/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
           'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
          },
          body: JSON.stringify({type:"unsend", recipientId: userId }),
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  return (
<>
  <IoMdArrowRoundBack
    onClick={handleGoBack}
    size={24}
    className="cursor-pointer text-[#B1B5C3] hover:text-[#4C9EEB] transition-colors ml-5 mt-4"
  />
  <div className="max-w-md mx-auto mt-6 p-4 bg-[#33373D] text-[#F7F7F7] border border-[#4C9EEB] rounded-lg">
    <h1 className="text-center text-2xl font-semibold">
      Add Friends
    </h1>
    <input
      type="text"
      placeholder="Search for friends"
      className="mt-6 w-full p-3 rounded-md border border-[#4C9EEB] bg-[#1A1D23] text-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-[#4C9EEB] focus:border-[#4C9EEB] transition-shadow"
      onChange={(e) => setSearchQuery(e.target.value)}
    />

    {users.length == 0 ? (
      <div className="mt-4">
        <p className="text-center text-[#B1B5C3]">
          Search results will appear here...
        </p>
      </div>
    ) : (
      ""
    )}
    {users.map((item) => {
      return (
        <UserCard
          key={item.id}
          imageUrl={item.image}
          name={item.name}
          bio={item?.bio}
          isFriendRequestSent={item?.isFriendRequestSent}
          status={item?.status}
          onRequest={onRequest}
          OnUnSend={OnUnSend}
          userId={item.id}
        />
      );
    })}
  </div>
</>
  );
};
