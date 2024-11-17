import ProfileImageShimmer from "../utils/ProfileImageShimmer";
import React, { useEffect, useState } from "react";
import userImage from "../assets/user.svg";

interface UserCardProps {
  imageUrl: string;
  name: string;
  bio?: string | undefined;
  onRequest: (userId: string) => Promise<boolean>;
  userId: string;
  isFriendRequestSent: boolean;
  status: string;
  OnUnSend:(userId: string) => Promise<boolean>;
}

export const UserCard: React.FC<UserCardProps> = ({
  imageUrl,
  name,
  bio,
  onRequest,
  OnUnSend,
  userId,
  isFriendRequestSent,
}) => {
  const [profileImage, setProfileImage] = useState<string>(userImage);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  // if(isFriendRequestSent) setButtonText("sent")

  useEffect(() =>{
    setFriendRequestSent(isFriendRequestSent)
  },[isFriendRequestSent])
  useEffect(() => {
    const image = new Image() as HTMLImageElement;
    image.src = imageUrl;
    image.onload = () => {
      setProfileImage(imageUrl);
      setLoading(false);
    };
    image.onerror = (err) => {
      console.log("image loading error", err);
      setProfileImage(userImage);
      setLoading(false);
    };
  }, [imageUrl]);

  const handleRequest = async () => {
    const sendingRq = await onRequest(userId);
    if(sendingRq) setFriendRequestSent(true);
  };
  const handleUnSendRequest = async () =>{
    const unSendingRq = await OnUnSend(userId);
    if(unSendingRq) setFriendRequestSent((prev) => !prev);
  } 

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-md mb-4">
      {loading ? (
        <ProfileImageShimmer />
      ) : (
        <img
          src={profileImage}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
      )}

      <div className="ml-4 flex-grow">
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
        {bio && (
          <p className="text-sm text-gray-600 mt-1">{bio.slice(0, 30)}...</p>
        )}
      </div>

      {friendRequestSent ? (
        <button
        
          onClick={handleUnSendRequest}
          className={`text-white bg-orange-400 text-sm px-5 py-2 rounded-md transition-colors`}
          >Remove</button>
      ) : (
        <button
          onClick={handleRequest}
          className={`text-white bg-blue-600 text-sm px-5 py-2 rounded-md transition-colors`}
        >Request</button>
      )}
    </div>
  );
};

export default UserCard;
