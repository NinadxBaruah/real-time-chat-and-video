import { useUserDetailsContext } from "../utils/UserDetailsContext";

interface MessagesType {
  id: string;
  message: string;
  name: string;
  picture: string;
  timeStamp: string;
  handleInbox: (id: string, name: string, image: string) => Promise<void>;
  isNewMessage: boolean; // New prop to track if the message is new
}

export function Messages({
  id,
  message,
  name,
  picture,
  timeStamp,
  handleInbox,
  isNewMessage, // Destructure the new prop
}: MessagesType) {
  const { userDetails } = useUserDetailsContext();

  function handleClick(id: string, name: string, image: string) {
    handleInbox(id, name, image);
  }

  return (
    <div 
  onClick={() => handleClick(id, name, picture)}
  className="w-full pt-3 pb-3 pl-3 cursor-pointer flex hover:bg-[#33373D] transition-colors duration-300 bg-[#1A1D23] text-[#F7F7F7]"
>
  <img className="w-12 rounded-full mr-2" src={picture} />
  <div className="w-full flex flex-col">
    <div className="flex justify-between items-center">
      <span className="text-[#B1B5C3]">{name}</span>

      {isNewMessage && (
        <span className="w-3 h-3 bg-[#34C759] rounded-full mr-2"></span>
      )}

      <span className="text-[#B1B5C3] mr-7">
        {new Date(timeStamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>

    <span className="text-[#F7F7F7]">
      {userDetails.user_id === id ? `You: ${message}` : message}
    </span>
  </div>
</div>
  );
}
