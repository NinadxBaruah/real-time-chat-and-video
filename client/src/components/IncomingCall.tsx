import React, { SetStateAction } from 'react';
import { FcEndCall, FcPhone } from 'react-icons/fc';
import { useUserDetailsContext } from '../utils/UserDetailsContext';
import { useSocket } from '../utils/useSocket';



const IncomingCall: React.FC = () => {

    const {userDetails}   = useUserDetailsContext();
    const {socket} = useSocket();
    const {showIncomingCall , setShowIncomingCall , setVideoCallPage , setUserDetails} = useUserDetailsContext();

    function onReject (){
        if(showIncomingCall){
          setShowIncomingCall(false);
          console.log("reject msg send")
          socket?.send(JSON.stringify({type:"reject" , sendTo:userDetails.incomingCall.id.toString() , user_id:userDetails.user_id}))

        }
    }

    function onAccept() {
      setVideoCallPage({callerVideo:false,answerVideo:true, rest:false});
      setShowIncomingCall(false);
      setUserDetails((prev) =>{
        return {...prev , incomingCall : {...prev.incomingCall,type:'recieve'}}
      })
    }

  return (
    <div id="callNotification" className="call-notification" style={{top:`${showIncomingCall == true ? '10px' : '0px' }`}}>
    <div className="call-notification-content">
      <p className="call-message">{userDetails.incomingCall.name} is calling</p>
      <div className="call-actions">
        <button onClick={onAccept} className="call-action-btn accept">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            />
          </svg>
        </button>
        <button onClick={onReject} className="call-action-btn reject">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
             strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round" 
          >
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
  );
};

export default IncomingCall;
