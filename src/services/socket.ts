import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initSocket = token => {
  socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
    reconnectionDelayMax: 10000,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const getSocket = () => {
  return socket;
};
