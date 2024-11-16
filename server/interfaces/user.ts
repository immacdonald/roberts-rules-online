import { compare } from 'bcrypt';
import { Socket } from 'socket.io';
import { CommitteeData } from '../../types';
import { Committees as CommitteesClass } from '../controllers/committees';
import { Database } from '../db';
import { Motion } from './motion';

const sql = Database.getInstance();

export class User {
    public readonly id: string;
    public username: string;
    public displayname: string;
    public readonly email: string;
    public creationDate: number;
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

            const Committees: CommitteesClass = CommitteesClass.instance;

            this.socket.on('getCommittees', async () => {
                console.log('Getting committees');
                await sql.query("SELECT * FROM committees WHERE owner = ? OR JSON_EXISTS(members, CONCAT('$.', ?))", [this.id, this.id], async (err, res) => {
                    if (!err) {
                        //const data = JSON.parse(JSON.stringify(res));
                        const data: CommitteeData[] = res.map((row: any) => ({
                            ...row,
                            members: JSON.parse(row.members)
                        }));

                        const clientTable = await Committees.populateCommitteeMembers(data);
                        this.socket!.emit('setCommittees', clientTable);
                        //this.socket.emit('setCommittees', data);
                    }
                });
            });

            this.socket.on('getMotions', async (committeeId) => {
                if (!committeeId) {
                    return;
                }
                const thisCommittee = Committees.getCommitteeById(committeeId);
                if (thisCommittee) {
                    if (thisCommittee.isMember(this.id)) {
                        const motions = await thisCommittee.getMotions();
                        if (motions) {
                            console.log('Motions were sent to all clients');
                        }
                    } else {
                        console.log('User is not a member');
                        return this.socket!.emit('setMotions', []);
                    }
                } else {
                    console.log('Committee not found');
                    return this.socket!.emit('setMotions', []);
                }
            });

            this.socket.on('createMotion', async (data) => {
                console.log('Creating motion', data);
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
                if (thisCommittee) {
                    console.log('Committee found');
                    if (thisCommittee.isMember(this.id)) {
                        console.log('User is a member');
                        if (thisCommittee.canUserDoAction(this.id, 'createMotion')) {
                            console.log('User can create motion');
                            const id = await thisCommittee.createMotion(this.id, data.title);
                            const motion = await thisCommittee.getMotionById(id);
                            thisCommittee.sendToAllMembers('addMotion', {
                                committeeId: data.committeeId,
                                motion: motion,
                                id: id
                            });
                        }
                    }
                }
            });

            this.socket.on('motion.changeTitle', (data) => {
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
                const thisCommittee = Committees.getCommitteeById(data.committeeId);
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
