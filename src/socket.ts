import { io, Socket } from 'socket.io-client';

const url = process.env.NODE_ENV == 'production' ? 'https://roberts-rules-online.onrender.com' : 'http://localhost:3000';

let socket: Socket | null = null;

// Function to initialize the socket after login
export const initializeSocket = (): Socket | null => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    if (!socket) {
        socket = io(url, {
            query: { token }
        });
    }

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket = null;
    }
};

export { socket };
