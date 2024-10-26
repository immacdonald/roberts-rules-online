import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

const token = localStorage.getItem('token');

// Creating socket
const socket: Socket = token ? io(URL, { query: { token } }) : io(URL);

export { socket };
