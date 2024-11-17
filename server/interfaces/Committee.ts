import { nanoid } from 'nanoid';
import { CommitteeMember } from '../../types';
import { getUserConnection } from '../controllers/connections';
import { Motions } from '../controllers/motions';
import { Database } from '../db';
import { Motion } from './motion';

const sql = Database.getInstance();

type MotionData = {
    id: string;
    committeeId: string;
    authorId: string;
    title: string;
    flag: string;
    description: string;
    vote: string;
    summary: string;
    relatedId: string;
    status: string;
    decisionTime: number;
    creationDate: number;
};

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

    public getMotions(): Promise<Motion[]> {
        const motions = this.motions.getMotions();
        return motions;
    }

    public getMotionById(id: string): Motion | undefined {
        return this.motions.findMotion(id);
    }

    public canUserDoAction(userId: string, action: string): boolean {
        if (userId === this.owner) {
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

    public async createMotion(userId: string, title: string): Promise<string> {
        let id = nanoid(16);
        while (await doesMotionExist(id)) {
            id = nanoid(16);
        }

        const info: MotionData = {
            id: id,
            committeeId: this.id,
            authorId: userId,
            title: title,
            flag: '',
            description: '',
            vote: '{}',
            summary: '',
            relatedId: '',
            status: 'pending',
            decisionTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
            creationDate: Date.now()
        };

        await this.motions.createMotion(info);
        return id;
    }

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members.some((member) => member.id == userId);
    }
}
