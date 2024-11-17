import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useUserDetailsContext } from "../utils/UserDetailsContext";
import { useEffect, useRef, useState } from "react";
import { AlertModal } from "./AlertModal";
import { useAuth } from "../utils/AuthContext";

interface MenuItems {
  profile: boolean;
  addFriends: boolean;
  notifications: boolean;
}

interface ProfileProps {
  setShowMenuItems?: React.Dispatch<React.SetStateAction<MenuItems>>;
  setShowLeftHomePage?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Profile = ({
  setShowMenuItems,
  setShowLeftHomePage,
}: ProfileProps) => {
  const navigate = useNavigate();
  const { userDetails, fetchUserData, setBio } = useUserDetailsContext();
  const { name, image, bio } = userDetails;
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const [bioText, setBioText] = useState(bio);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { logout } = useAuth();
  useEffect(() => {
    fetchUserData();
  }, []);
  const handleGoBack = () => {
    if (setShowMenuItems) {
      setShowMenuItems((prevState) => ({
        ...prevState,
        profile: false,
      }));
      if (setShowLeftHomePage) setShowLeftHomePage(true);
    }
    navigate("/projects/chat-app");
  };
  useEffect(() => {
    setBioText(bio);
  }, [bio]);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `/projects/chat-app/api/v1/search/user/profile/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Origin': `${import.meta.env.VITE_APP_ORIGIN}`
          },
          body: JSON.stringify({ bio: bioText }),
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (bioRef.current?.value) {
          setBio(bioRef.current?.value);
          setShowModal(true);
          console.log("set to true");
          setTimeout(() => {
            setShowModal(false);
            console.log("set to false");
          }, 2000);
        }

        console.log(data);
      } 
      // else if (response.status == 401) {
      //   logout();
      //   navigate("/projects/chat-app");
      // }
       else {
        console.log("Error");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
<>
  <IoMdArrowRoundBack
    onClick={handleGoBack}
    size={24}
    className="self-start mt-2 ml-2 cursor-pointer text-[#B1B5C3] hover:text-[#4C9EEB] transition-colors"
  />
  <div className="flex flex-col items-center bg-[#33373D] text-[#F7F7F7] h-full p-6 rounded-lg max-w-lg mx-auto border border-[#4C9EEB]">
    {showModal && (
      <AlertModal message={"Bio Updated"} color={"bg-[#34C759]"} />
    )}

    <h1 className="text-3xl font-semibold mt-6 text-[#F7F7F7]">Profile</h1>
    <img
      src={image}
      alt="Profile"
      className="w-32 h-32 rounded-full mt-6 border-2 border-[#4C9EEB]"
    />
    <span className="mt-4 text-xl font-medium text-[#F7F7F7]">{name}</span>
    <textarea
      ref={bioRef}
      value={bioText}
      onChange={(e) => setBioText(e.target.value)}
      className="mt-4 w-3/4 h-28 p-3 bg-[#1A1D23] text-[#F7F7F7] border border-[#4C9EEB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4C9EEB] resize-none"
      placeholder="Write something about yourself..."
    />
    <div className="flex mt-6 space-x-4">
      <button
        onClick={handleSave}
        className="px-5 py-2 bg-[#4C9EEB] text-[#F7F7F7] rounded-md hover:bg-[#3B7DD4] transition-colors"
      >
        Save
      </button>
    </div>
  </div>
</>
  );
};
