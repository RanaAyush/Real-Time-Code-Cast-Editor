
import { io,Socket } from "socket.io-client";

export const initSocket = async (): Promise<Socket> => {
  const socket = io('http://44.201.188.201:5000', {
    transports: ["websocket"],
    reconnectionAttempts: 10,
    timeout: 20000, 
    forceNew:true
  });
  return socket;
};
