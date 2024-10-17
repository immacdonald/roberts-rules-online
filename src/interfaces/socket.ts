import { io, Socket } from 'socket.io-client';
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000'; // "undefined" means the URL will be computed from the `window.location` object
// Singleton
export class MySocket {
    public socket: Socket;
    public static instance: MySocket = new MySocket();

    private constructor() {
        console.log('Creating socket...');

        // Retrieve the token from local storage
        const token = localStorage.getItem('token');

        // Pass the token in the query when creating the Socket.IO connection
        if (token) {
            this.socket = io(URL, {
                query: { token }
            });
        } else {
            this.socket = io(URL);
        }
    }
}
