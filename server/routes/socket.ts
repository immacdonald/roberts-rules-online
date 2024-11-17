import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { CommitteeData } from '../../types';
import { Committees } from '../controllers/committees';
import { addUserConnection, removeUserConnection } from '../controllers/connections';
import { Motions } from '../controllers/motions';
import * as Users from '../controllers/users';
import { Database } from '../db';

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

        const sql = Database.getInstance();

        socket.on('chatMessage', (msg) => {
            console.log('message: ' + msg);
        });

        // General testing socket endpoint for debugging the backend (triggered by 'Q' on the website)
        socket.on('test', () => {
            //Users.debugUsers();
        });

        socket.on('getCommittees', async () => {
            const id = socket.data.id;
            await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [id, id], async (err, res) => {
                if (!err) {
                    const data: CommitteeData[] = res.map((row: any) => ({
                        ...row,
                        members: JSON.parse(row.members)
                    }));

                    const clientTable = await Committees.instance.populateCommitteeMembers(data);
                    socket.emit('setCommittees', clientTable);
                } else {
                    console.log(err);
                }
            });
        });

        socket.on('createCommittee', async (name: string, description: string) => {
            Committees.instance.createCommittee(name, description, socket.data.id, [{ id: socket.data.id, role: 'owner' }]);
        });

        socket.on('getMotions', async (committeeId) => {
            if (!committeeId) {
                return;
            }
            const thisCommittee = Committees.instance.getCommitteeById(committeeId);
            if (thisCommittee) {
                const motions = await thisCommittee.getMotions();
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

            const id = socket.data.id;
            const motions = new Motions(committeeId);

            motions.createLightweightMotion(committeeId, id, title);
        });

        // Remove the socket from the connections hashmap upon disconnect
        socket.on('disconnect', () => {
            removeUserConnection(socket.data.id);
        });
    });
};

export { setupSocketHandlers };
