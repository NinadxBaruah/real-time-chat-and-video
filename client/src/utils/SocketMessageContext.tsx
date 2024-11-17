import { createContext, useContext, useState } from "react";


interface messageDataType {
    socketMessage: any;
    setSocketMessage: (message: any) => void;
}

interface socketMessageType  {
    message:any;
}

interface SocketMessageContextProvierProps {
    children: React.ReactNode;
  }

const SocketMessageContext = createContext<messageDataType>({socketMessage:'' , setSocketMessage: () => {}});



export const SocketMessageContextProvier = ({children}:SocketMessageContextProvierProps) =>{
    const [socketMessage , setSocketMessage] = useState<socketMessageType>({message:''}) 


    return <SocketMessageContext.Provider value={{socketMessage , setSocketMessage}}>
        {children}
    </SocketMessageContext.Provider>
}


export const useSocketMessage = () =>{
    return useContext(SocketMessageContext)
}

