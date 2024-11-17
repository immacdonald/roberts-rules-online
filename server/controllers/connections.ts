import { Socket } from 'socket.io';

const connections: Record<string, Socket> = {};

// Add a user to the connections cache
const addUserConnection = (id: string, socket: Socket): void => {
    connections[id] = socket;
};

// Remove a user from the connections cache
const removeUserConnection = (id: string): void => {
    if (Object.getOwnPropertyDescriptor(connections, id)) {
        delete connections[id];
    }
};

// Get all users
const getAllUserConnections = (): { id: string; socket: Socket }[] => {
    return Object.entries(connections).map(([id, socket]) => ({ id, socket }));
};

// Find a user by ID
const getUserConnection = (id: string): Socket | null => {
    return Object.getOwnPropertyDescriptor(connections, id) ? connections[id] : null;
};

// Clear the connections cache
const clearCache = (): void => {
    for (const id in connections) {
        if (Object.getOwnPropertyDescriptor(connections, id)) {
            delete connections[id];
        }
    }
};

export { addUserConnection, removeUserConnection, getUserConnection, getAllUserConnections, clearCache };
