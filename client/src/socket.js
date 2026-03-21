import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
  transports:  ['websocket'],
  autoConnect: true,
  auth: {
    token: localStorage.getItem('cc_token'), // ← JWT so server knows who you are
  },
});

export default socket;
