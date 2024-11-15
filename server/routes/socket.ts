import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { CommitteeData } from '../../types';
import { Committees as CommitteesClass } from '../controllers/Committees';
import { addUserConnection, removeUserConnection } from '../controllers/connections';
import { Motions } from '../controllers/motions';
import { Database } from '../db';

const SECRET_KEY = 'DEV_SECRET_KEY';

const setupSocketHandlers = (io: Server) => {
    io.use((socket, next) => {
        const token = socket.handshake.query.token;

        // Proceed normally if no token is provided
        if (!token) {
            console.log('No token provided, allowing anonymous connection');
            return next();
        }

        // Verify the token if it is present
        jwt.verify(token as string, SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log('Failed to authenticate token:', err.message);
                return next();
            } else if (!decoded) {
                console.log('Failed to decode token');
                return next();
            } else {
                const user = decoded as { username: string; id: string };
                socket.data.username = user.username;
                socket.data.id = user.id;
                console.log(`Successfully authenticated user ${user.username} from JWT`);
            }
        });

        return next();
    });

    io.on('connection', (socket: Socket) => {
        console.log(`Client is connected (${socket.data.username})`);

        // Add socket to the connections hashmap upon initial connection
        addUserConnection(socket.data.id, socket);

        const sql = Database.getInstance();

        socket.on('chatMessage', (msg) => {
            console.log('message: ' + msg);
        });

        socket.on('getCommittees', async () => {
            const id = socket.data.id;
            await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [id, id], async (err, res) => {
                if (!err) {
                    const data: CommitteeData[] = res.map((row: any) => ({
                        ...row,
                        members: JSON.parse(row.members)
                    }));

                    const clientTable = await CommitteesClass.instance.populateCommitteeMembers(data);
                    socket.emit('setCommittees', clientTable);
                } else {
                    console.log(err);
                }
            });
        });

        socket.on('createCommittee', async (name: string, description: string) => {
            CommitteesClass.instance.createCommittee(name, description, socket.data.id, [{ id: socket.data.id, role: 'owner' }]);
        });

        socket.on('getMotions', async (committeeId) => {
            if (!committeeId) {
                return;
            }
            const thisCommittee = CommitteesClass.instance.getCommitteeById(committeeId);
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
            const motion = new Motions(committeeId);

            motion.createLightweightMotion(committeeId, id, title);
        });

        // Remove the socket from the connections hashmap upon disconnect
        socket.on('disconnect', () => {
            removeUserConnection(socket.data.id);
        });
    });
};

export { setupSocketHandlers };
