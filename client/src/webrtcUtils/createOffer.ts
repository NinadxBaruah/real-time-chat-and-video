import { MutableRefObject } from "react";

export const createOffer = (
  peerConnection: MutableRefObject<RTCPeerConnection | null>
): Promise<RTCSessionDescriptionInit> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (peerConnection) {
        const offer = await peerConnection.current?.createOffer();
       if(offer) resolve(offer);
      }
    } catch (error) {
      console.log("error while creating offer: ", error);
      reject(error);
    }
  });
};
