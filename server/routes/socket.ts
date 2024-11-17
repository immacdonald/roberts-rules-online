import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { createCommittee, getCommitteeById } from '../controllers/committees';
import { addUserConnection, removeUserConnection } from '../controllers/connections';
import { getCommittees } from '../controllers/users';

const SECRET_KEY = 'DEV_SECRET_KEY';

const setupSocketHandlers = (io: Server): void => {
    io.use((socket, next) => {
        const token = socket.handshake.query.token;

        // Proceed normally if no token is provided
        if (!token) {
            console.log('No token provided, disallowing anonymous connection');
            return next(new Error('Authentication error'));
        }

        // Verify the token if it is present
        jwt.verify(token as string, SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log('Failed to authenticate token:', err.message);
                return next(new Error('Authentication error'));
            } else if (!decoded) {
                console.log('Failed to decode token');
                return next(new Error('Authentication error'));
            } else {
                const user = decoded as { username: string; id: string };
                socket.data.username = user.username;
                socket.data.id = user.id;
                console.log(`Successfully authenticated user ${user.username} from JWT`);
                return next();
            }
        });
    });

    io.on('connection', (socket: Socket) => {
        console.log(`Client is connected (${socket.data.username})`);

        // Add socket to the connections hashmap upon initial connection
        addUserConnection(socket.data.id, socket);

        socket.on('chatMessage', (msg) => {
            console.log('message: ' + msg);
        });

        // General testing socket endpoint for debugging the backend (triggered by 'Q' on the website)
        socket.on('test', () => {
            //Users.debugUsers();
        });

        socket.on('getCommittees', async () => {
            const id = socket.data.id;
            const committees = await getCommittees(id);

            if (committees) {
                socket.emit('setCommittees', committees);
            } else {
                console.log('Error getting committees');
            }
        });

        socket.on('createCommittee', async (name: string, description: string) => {
            createCommittee(name, description, socket.data.id, [{ id: socket.data.id, role: 'owner' }]);
        });

        socket.on('getMotions', async (committeeId) => {
            if (!committeeId) {
                return;
            }
            const committee = getCommitteeById(committeeId);
            if (committee) {
                const motions = await committee.getMotions();
                //console.log("Got motions", motions);
                if (motions) {
                    socket.emit('setMotions', motions);
                }
            } else {
                console.log('Committee not found');
                return socket.emit('setMotions', []);
            }
        });

        socket.on('createMotion', async (committeeId, title) => {
            if (!committeeId) {
                return;
            }

            const committee = getCommitteeById(committeeId);
            if (committee) {
                const id = socket.data.id;
                committee.createMotion(id, title);
            } else {
                console.log('Committee not found to create motion');
            }
        });

        // Remove the socket from the connections hashmap upon disconnect
        socket.on('disconnect', () => {
            removeUserConnection(socket.data.id);
        });
    });
};

export { setupSocketHandlers };
