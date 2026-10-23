import { io } from 'socket.io-client';

// One Socket.IO connection per signed-in session (polygrid-backend
// src/socket/index.ts): the handshake carries the JWT, the server puts
// the socket in the user's room, and events arrive for that user only —
// `notification:new` today, chat messages later. In development it goes
// through Vite's /socket.io proxy (same origin, like /api); a production
// build connects to VITE_API_URL directly.
const URL = import.meta.env.DEV
	? undefined
	: import.meta.env.VITE_API_URL?.trim();

let socket = null;
let socketToken = null;

export const connectSocket = (token) => {
	if (socket && socketToken === token) return socket;
	disconnectSocket();
	socketToken = token;
	socket = io(URL, {
		auth: { token },
		// the backend's CORS list must include this origin in production
		withCredentials: true,
		transports: ['websocket', 'polling'],
	});
	return socket;
};

export const disconnectSocket = () => {
	socket?.disconnect();
	socket = null;
	socketToken = null;
};

export const getSocket = () => socket;
