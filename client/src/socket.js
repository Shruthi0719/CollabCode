import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
  transports: ['websocket'],
  autoConnect: true,
});

export default socket;