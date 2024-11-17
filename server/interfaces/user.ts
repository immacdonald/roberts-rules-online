import { compare } from 'bcrypt';
import { Socket } from 'socket.io';
import { Motion } from './motion';
import { getCommitteeById } from '../controllers/committees';

export class User {
    public readonly id: string;
    public username: string;
    public displayname: string;
    public readonly email: string;
    public readonly creationDate: number;
    private readonly password: string;
    public socket: Socket | null = null;

    constructor(id: string, username: string, email: string, password: string, displayname: string, creationDate: number | string) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayname = displayname;
        this.creationDate = typeof creationDate == 'string' ? parseInt(creationDate) : creationDate;
    }

    public async isPasswordCorrect(password: string): Promise<boolean> {
        return await compare(password, this.password);
    }

    public setSocket(socket: Socket): void {
        if (this.socket == null || this.socket !== socket) {
            this.socket = socket;

            this.socket.on('motion.changeTitle', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.alterTitle(data.title);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.setFlag', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.setFlag(data.flag);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.setVote', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.addVote(this.id, data.vote);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.removeVote', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.removeVote(this.id);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.setSummary', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.setSummary(data.summary);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.setDescription', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.setDescription(data.description);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.attachMotion', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.attachMotion(data.relatedId);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.detachMotion', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.attachMotion('');
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.setDecisionTime', (data) => {
                const thisCommittee = getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motion: Motion | null = thisCommittee.getMotionById(data.id) ?? null;
                        if (motion) {
                            motion.setDecisionTime(data.decisionTime);
                            thisCommittee.sendToAllMembers('setMotion', {
                                committeeId: data.committeeId,
                                motion: motion
                            });
                        }
                    }
                }
            });
        } else {
            console.log('Socket already set or invalid');
        }
    }
}
