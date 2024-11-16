import { io, Socket } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000';

let socket: Socket | null = null;

// Function to initialize the socket after login
export const initializeSocket = (): Socket | null => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    if (!socket) {
        socket = io(URL, { query: { token } });
    }

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket = null;
    }
};

export { socket };
