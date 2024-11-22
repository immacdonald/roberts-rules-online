import { nanoid } from 'nanoid';
import { CommitteeMember, CommitteeRole, MotionData, Sentiment } from '../../types';
import { addOrReplaceInArrayById } from '../../utility';
import { getUserConnection } from '../controllers/connections';
import { Motions } from '../controllers/motions';
import { findUserByEmail, findUserByUsername, getCommittees } from '../controllers/users';
import { Database } from '../db';
import { serverConfig } from '../server-config';
import { Motion } from './motion';

const sql = Database.getInstance();

async function doesMotionExist(id: string): Promise<boolean> {
    const res = await sql.query('SELECT id FROM motions WHERE id = ?', [id]);
    return res.length > 0;
}

export class Committee {
    public readonly id: string;
    public name: string;
    public description: string;
    public owner: string;
    public members: CommitteeMember[];
    public motions: Motions;
    public flag: string | null;

    constructor(id: string, name: string, description: string, owner: string, members: string | CommitteeMember[], flag: string | null) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.members = typeof members == 'string' ? (JSON.parse(members) as CommitteeMember[]) : members;
        this.motions = new Motions(id);
        this.flag = flag;
    }

    public sendToMember = (event: string, data: any, id: string): void => {
        const socket = getUserConnection(id);

        if (socket) {
            socket.emit(event, data);
        }
    };

    public sendToAllMembers(event: string, data: any): void {
        for (const member of this.members) {
            this.sendToMember(event, data, member.id);
        }
    }

    public sendToAllMembersExcept(event: string, data: any, excludeId: string): void {
        for (const member of this.members) {
            if (member.id != excludeId) {
                this.sendToMember(event, data, member.id);
            }
        }
    }

    public canUserDoAction(userId: string, action: string): boolean {
        if (userId == this.owner) {
            // Owners can do everything
            return true;
        }

        const member = this.members.find((user: CommitteeMember) => user.id == userId);
        if (member) {
            // This is the permission system for committees
            if (action == 'createMotion') {
                return true;
            } else if (action == 'inviteUser') {
                return member.role == 'chair';
            } else if (action == 'removeUser') {
                return member.role == 'chair';
            } else if (action == 'changeUserRole') {
                return member.role == 'chair';
            }
        } else {
            console.log('User not member');
        }

        return false;
    }

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members.some((member) => member.id == userId);
    }

    private getMembersForDatabase = (): string => {
        return JSON.stringify(
            this.members.map((member: CommitteeMember) => {
                const memberCopy = { ...member };
                delete memberCopy.displayname;
                delete memberCopy.username;
                return memberCopy;
            })
        );
    };

    public addUser = async (originatorId: string, newUser: string): Promise<void> => {
        if (this.canUserDoAction(originatorId, 'inviteUser')) {
            let user = await findUserByUsername(newUser);
            if (!user) {
                user = await findUserByEmail(newUser);
            }

            if (user && !this.isMember(user.id)) {
                this.members.push({ id: user.id, role: 'member', username: user.username, displayname: user.displayname });
                await sql.query(
                    `
                    UPDATE committees
                    SET members = ?
                    WHERE id = '${this.id}';
                `,
                    [this.getMembersForDatabase()]
                );

                this.sendUpdatedCommittee();
            }
        }
    };

    public removeUser = async (originatorId: string, userId: string): Promise<void> => {
        if (this.canUserDoAction(originatorId, 'removeUser') || originatorId == userId) {
            if (userId != this.owner && this.isMember(userId)) {
                this.members = this.members.filter((member) => member.id != userId);
                await sql.query(
                    `
                    UPDATE committees
                    SET members = ?
                    WHERE id = '${this.id}';
                `,
                    [this.getMembersForDatabase()]
                );

                await this.sendUpdatedCommittee();
                const removedUserCommittees = await getCommittees(userId);
                getUserConnection(userId)?.emit('setCommittees', removedUserCommittees);
            }
        }
    };

    public changeUserRole = async (originatorId: string, userId: string, role: CommitteeRole): Promise<void> => {
        if (this.canUserDoAction(originatorId, 'changeUserRole')) {
            if (userId != this.owner && this.isMember(userId)) {
                const updatedMember = this.members.find((member) => member.id == userId);
                if (updatedMember && updatedMember.role != 'owner') {
                    updatedMember.role = role;
                    this.members = addOrReplaceInArrayById(this.members, updatedMember);

                    await sql.query(
                        `
                    UPDATE committees
                    SET members = ?
                    WHERE id = '${this.id}';
                    `,
                        [this.getMembersForDatabase()]
                    );

                    this.sendUpdatedCommittee();
                }
            }
        }
    };

    public changeUserRole = async (originatorId: string, userId: string, role: CommitteeRole): Promise<void> => {
        if (this.canUserDoAction(originatorId, 'changeUserRole')) {
            if (userId != this.owner && this.isMember(userId)) {
                const updatedMember = this.members.find((member) => member.id == userId);
                if (updatedMember && updatedMember.role != 'owner') {
                    updatedMember.role = role;
                    this.members = addOrReplaceInArrayById(this.members, updatedMember);

                    await sql.query(
                        `
                    UPDATE committees
                    SET members = ?
                    WHERE id = '${this.id}';
                    `,
                        [this.getMembersForDatabase()]
                    );

                    this.sendUpdatedCommittee();
                }
            }
        }
    };

    public updateFlag = async (originatorId: string, flag: string): Promise<void> => {
        if (this.canUserDoAction(originatorId, 'updateFlag')) {
            this.flag = flag;

            await sql.query(
                `
                    UPDATE committees
                    SET flag = ?
                    WHERE id = '${this.id}';
                    `,
                [this.flag]
            );

            await this.sendUpdatedCommittee();
        }
    };

    public getMotions = async (): Promise<Motion[]> => {
        const motions = (await this.motions.getMotions()).filter((motion, index, self) => self.findIndex((m) => m.id === motion.id) === index);
        return motions;
    };

    public getMotionById = async (id: string): Promise<Motion | null> => {
        return (await this.motions.findMotion(id)) ?? null;
    };

    public sendUpdatedCommittee = async (): Promise<void> => {
        const motions = await this.getMotions();

        const data = {
            id: this.id,
            name: this.name,
            description: this.description,
            owner: this.owner,
            members: this.members
        };
        await this.sendToAllMembers('updatedCommittee', data);
    };

    public sendUpdatedMotions = async (): Promise<void> => {
        const updatedMotions = await this.getMotions();
        await this.sendToAllMembers(
            'setMotions',
            updatedMotions.filter((motion, index, self) => self.findIndex((m) => m.id === motion.id) === index)
        );
    };

    // Motion creation/update methods
    public createMotion = async (userId: string, title: string, description: string, flag: MotionFlag | null, relatedMotionId?: string): Promise<void> => {
        let id = nanoid(16);
        while (await doesMotionExist(id)) {
            id = nanoid(16);
        }

        if (this.canUserDoAction(userId, 'createMotion')) {
            const info: MotionData = {
                id: id,
                committeeId: this.id,
                authorId: userId,
                title: title,
                flag: flag || '',
                description: description || '',
                comments: [],
                vote: {},
                summary: null,
                relatedId: relatedMotionId || '',
                status: 'open',
                decisionTime: Date.now() + serverConfig.committees.defaultDaysUntilVote * 24 * 60 * 60 * 1000,
                creationDate: Date.now()
            };

            await this.motions.createMotion(info);
            await this.sendUpdatedMotions();
        }
    };

    public changeMotionTitle = async (motionId: string, userId: string, title: string): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.alterTitle(title);
                await this.sendUpdatedMotions();
            }
        }
    };

    public changeMotionDescription = async (motionId: string, userId: string, description: string): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.setDescription(description);
                await this.sendUpdatedMotions();
            }
        }
    };

    public setMotionFlag = async (motionId: string, userId: string, flag: MotionFlag): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.setFlag(flag);
                await this.sendUpdatedMotions();
            }
        }
    };

    public addMotionVote = async (motionId: string, userId: string, vote: Vote): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            await motion.addVote(userId, vote);
            await this.sendUpdatedMotions();
        }
    };

    public removeMotionVote = async (motionId: string, userId: string): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            await motion.removeVote(userId);
            await this.sendUpdatedMotions();
        }
    };

    public setMotionRelatedTo = async (motionId: string, userId: string, relatedId: string): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.attachMotion(relatedId);
                await this.sendUpdatedMotions();
            }
        }
    };

    public changeMotionDecisionTime = async (motionId: string, userId: string, decisionTime: number): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId || this.canUserDoAction(userId, 'endMotionVoting')) {
                await motion.setDecisionTime(decisionTime);
                await this.sendUpdatedMotions();
            }
        }
    };

    public setMotionSummary = async (motionId: string, userId: string, passed: boolean, summary: MotionSummary): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (this.canUserDoAction(userId, 'writeMotionSummary')) {
                await motion.setSummary(summary);
                await motion.setStatus(passed ? 'passed' : 'failed');
                await this.sendUpdatedMotions();
            }
        }
    };

    public addMotionComment = async (motionId: string, userId: string, sentiment: Sentiment, comment: string, parentCommentId?: string): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            await motion.addComment(userId, sentiment, comment, parentCommentId);
            await this.sendUpdatedMotions();
        }
    };

    public removeMotionComment = async (motionId: string, userId: string, commentId: string): Promise<void> => {
        const motion: Motion | null = await this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.removeComment(commentId);
                await this.sendUpdatedMotions();
            }
        }
    };
}
