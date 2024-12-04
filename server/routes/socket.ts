import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { CommitteeRole, MotionFlag, Sentiment, Vote } from '../../types';
import { createCommittee, getCommitteeById } from '../controllers/committees';
import { addUserConnection, removeUserConnection } from '../controllers/connections';
import { getCommittees, updateUserName } from '../controllers/users';
import { serverConfig } from '../server-config';

const setupSocketHandlers = (io: Server): void => {
    io.use((socket, next) => {
        const token = socket.handshake.query.token;

        // Proceed normally if no token is provided
        if (!token) {
            console.log('No token provided, disallowing anonymous connection');
            return next(new Error('Authentication error'));
        }

        // Verify the token if it is present
        jwt.verify(token as string, serverConfig.jwt.secretKey, (err, decoded) => {
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

        const userId: string = socket.data.id;

        // General testing socket endpoint for debugging the backend (triggered by 'Q' on the website)
        socket.on('test', () => {
            //debugUsers();
        });

        socket.on('getCommittees', async () => {
            const committees = await getCommittees(userId);

            if (committees) {
                socket.emit('setCommittees', committees);
            } else {
                console.log('Error getting committees');
            }
        });

        socket.on('updateUserName', async (name: string) => {
            await updateUserName(userId, name);
        });

        socket.on('createCommittee', async (name: string, description: string) => {
            createCommittee(name, description, userId, [{ id: userId, role: 'owner' }]);
        });

        socket.on('addUserToCommittee', async (committeeId: string, user: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.addUser(userId, user);
            } else {
                console.log('Committee not found to add user');
            }
        });

        socket.on('removeUserFromCommittee', async (committeeId: string, user: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.removeUser(userId, user);
            } else {
                console.log('Committee not found to remove user');
            }
        });

        socket.on('changeUserRole', async (committeeId: string, user: string, role: CommitteeRole) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.changeUserRole(userId, user, role);
            } else {
                console.log('Committee not found to remove user');
            }
        });

        socket.on('updateCommitteeFlag', async (committeeId: string, flag: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.updateFlag(userId, flag);
            } else {
                console.log('Committee not found to update flag');
            }
        });

        socket.on('getMotions', async (committeeId: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                const motions = await committee.getMotions();
                if (motions) {
                    socket.emit('setMotions', motions);
                }
            } else {
                console.log('Committee not found');
                socket.emit('setMotions', []);
            }
        });

        socket.on('createMotion', async (committeeId: string, title: string, description: string, flag: MotionFlag | null, relatedMotionId?: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.createMotion(userId, title, description, flag, relatedMotionId);
            } else {
                console.log('Committee not found to create motion');
            }
        });

        socket.on('changeMotionTitle', async (committeeId: string, motionId: string, title: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.changeMotionTitle(motionId, userId, title);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('changeMotionDescription', async (committeeId: string, motionId: string, description: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.changeMotionDescription(motionId, userId, description);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('setMotionFlag', async (committeeId: string, motionId: string, flag: MotionFlag) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.setMotionFlag(motionId, userId, flag);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('addMotionVote', async (committeeId: string, motionId: string, vote: Vote) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.addMotionVote(motionId, userId, vote);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('removeMotionVote', async (committeeId: string, motionId: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.removeMotionVote(motionId, userId);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('setMotionRelatedTo', async (committeeId: string, motionId: string, relatedId: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.setMotionRelatedTo(motionId, userId, relatedId);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('unsetMotionRelatedTo', async (committeeId: string, motionId: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                // Use '' to unset the motion's related field
                committee.setMotionRelatedTo(motionId, userId, '');
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('changeMotionDecisionTime', async (committeeId: string, motionId: string, decisionTime: string | number) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                const time: number = typeof decisionTime == 'string' ? parseInt(decisionTime) : decisionTime;
                committee.changeMotionDecisionTime(motionId, userId, time);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('setMotionSummary', async (committeeId: string, motionId: string, passed: boolean, summary: string, pros?: string, cons?: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.setMotionSummary(motionId, userId, passed, {
                    summary,
                    pros: pros || 'See summary.',
                    cons: cons || 'See summary.'
                });
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('addMotionComment', async (committeeId: string, motionId: string, sentiment: Sentiment, comment: string, parentCommentId?: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.addMotionComment(motionId, userId, sentiment, comment, parentCommentId);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        socket.on('removeMotionComment', async (committeeId: string, motionId: string, commentId: string) => {
            const committee = getCommitteeById(committeeId);
            if (committee) {
                committee.removeMotionComment(motionId, userId, commentId);
            } else {
                console.log('Committee not found to modify motion');
            }
        });

        // Remove the socket from the connections hashmap upon disconnect
        socket.on('disconnect', () => {
            removeUserConnection(socket.data.id);
        });
    });
};

export { setupSocketHandlers };
