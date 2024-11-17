import { MutableRefObject } from "react";

export const createAnswer = (
  peerConnection: MutableRefObject<RTCPeerConnection | null>
): Promise<RTCSessionDescriptionInit> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (peerConnection) {
        const answer = await peerConnection.current?.createAnswer();
       if(answer) resolve(answer);
      }
    } catch (error) {
      console.log("error while creating answer: ", error);
      reject(error);
    }
  });
};
