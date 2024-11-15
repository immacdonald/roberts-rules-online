import { CommitteeMember } from '../../types';
import { getUserConnection } from '../controllers/connections';
import { Motions } from '../controllers/motions';
import { Users as UsersClass } from '../controllers/users';
import { Motion } from './motion';

let Users: UsersClass;

export class Committee {
    public readonly id: string;
    public name: string;
    public description: string;
    public owner: string;
    public members: CommitteeMember[];
    public MotionsClass: Motions;

    constructor(id: string, name: string, owner: string, members: string | CommitteeMember[]) {
        if (!Users) {
            Users = UsersClass.instance;
        }

        this.id = id;
        this.name = name;
        this.owner = owner;
        this.members = typeof members == 'string' ? (JSON.parse(members) as CommitteeMember[]) : members;
        this.MotionsClass = new Motions(id);
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
        const motions = this.MotionsClass.getMotions();
        return motions;
    }

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members.some((member) => member.id == userId);
    }
}
