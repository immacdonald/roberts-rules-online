import { io, Socket } from 'socket.io-client';
import { clientConfig } from './client-config';

let socket: Socket | null = null;

// Function to initialize the socket after login
export const initializeSocket = (): Socket | null => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    if (!socket) {
        socket = io(clientConfig.url, {
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
