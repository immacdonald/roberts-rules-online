import { nanoid } from 'nanoid';
import { CommitteeMember, MotionData } from '../../types';
import { config } from '../config';
import { getUserConnection } from '../controllers/connections';
import { Motions } from '../controllers/motions';
import { Database } from '../db';
import { Motion } from './motion';

const sql = Database.getInstance();

async function doesMotionExist(id: string): Promise<boolean> {
    const res = await sql.query('SELECT id FROM motions WHERE id = ?', [id]);
    return res.length > 0;
}

export class Committee {
    public readonly id: string;
    public name: string;
    //public description: string;
    public owner: string;
    public members: CommitteeMember[];
    public motions: Motions;

    constructor(id: string, name: string, owner: string, members: string | CommitteeMember[]) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.members = typeof members == 'string' ? (JSON.parse(members) as CommitteeMember[]) : members;
        this.motions = new Motions(id);
        this.motions.getMotions(); // Populate motions (We can put notifications on the list of committees if a motion needs attention)
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
            if (action === 'createMotion') {
                return true;
            }
        } else {
            console.log('User not member');
        }

        return false;
    }

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members.some((member) => member.id == userId);
    }

    public getMotions(): Promise<Motion[]> {
        const motions = this.motions.getMotions();
        return motions;
    }

    public getMotionById(id: string): Motion | null {
        return this.motions.findMotion(id) ?? null;
    }

    public sendUpdatedMotions = async (): Promise<void> => {
        const updatedMotions = await this.getMotions();
        await this.sendToAllMembers('setMotions', updatedMotions);
    };

    // Motion creation/update methods
    public createMotion = async (userId: string, title: string, description?: string, relatedMotionId?: string): Promise<void> => {
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
                flag: '',
                description: description || '',
                vote: '{}',
                summary: '',
                relatedId: relatedMotionId || '',
                status: 'pending',
                decisionTime: Date.now() + config.defaultDaysUntilVote * 24 * 60 * 60 * 1000,
                creationDate: Date.now()
            };

            await this.motions.createMotion(info);
            await this.sendUpdatedMotions();
        }
    };

    public changeMotionTitle = async (motionId: string, userId: string, title: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.alterTitle(title);
                await this.sendUpdatedMotions();
            }
        }
    };

    public changeMotionDescription = async (motionId: string, userId: string, description: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.setDescription(description);
                await this.sendUpdatedMotions();
            }
        }
    };

    public setMotionFlag = async (motionId: string, userId: string, flag: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.setFlag(flag);
                await this.sendUpdatedMotions();
            }
        }
    };

    public addMotionVote = async (motionId: string, userId: string, vote: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            await motion.addVote(userId, vote);
            await this.sendUpdatedMotions();
        }
    };

    public removeMotionVote = async (motionId: string, userId: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            await motion.removeVote(userId);
            await this.sendUpdatedMotions();
        }
    };

    public setMotionRelatedTo = async (motionId: string, userId: string, relatedId: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.attachMotion(relatedId);
                await this.sendUpdatedMotions();
            }
        }
    };

    public changeMotionDecisionTime = async (motionId: string, userId: string, decisionTime: number): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.setDecisionTime(decisionTime);
                await this.sendUpdatedMotions();
            }
        }
    };

    public setMotionSummary = async (motionId: string, userId: string, summary: string): Promise<void> => {
        const motion: Motion | null = this.getMotionById(motionId);
        if (motion) {
            if (motion.authorId == userId) {
                await motion.setSummary(summary);
                await this.sendUpdatedMotions();
            }
        }
    };
}
