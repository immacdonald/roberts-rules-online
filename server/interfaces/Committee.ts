import { CommitteeMember } from '../../types';
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
        this.members = typeof members == 'string' ? JSON.parse(members) as CommitteeMember[] : members;
        this.MotionsClass = new Motions(id);
    }

    public sendToAllMembers(event: string, data: any): void {
        for (const member of this.members) {
            const user = Users.findUserById(member.id);
            /*if (user) {
                if (user.socket) {
                    user.socket.emit(event, data);
                } else {
                    console.log(`Cannot send to ${user.displayname} because socket is undefined`);
                }
            }*/
        }
    }

    public sendToAllMembersExcept(event: string, data: any, userId: string): void {
        for (const member in this.members) {
            if (member !== userId) {
                const user = Users.findUserById(member);
                /*if (user) {
                    if (user.socket) {
                        user.socket.emit(event, data);
                    } else {
                        console.log(`Cannot send to ${user.displayname} because socket is undefined`);
                    }
                }*/
            }
        }
    }

    public getMotions(updateClients: boolean): Promise<Motion[]> {
        const motions = this.MotionsClass.getMotions();
        console.log(motions);
        if (updateClients) {
            motions.then((data: Motion[]) => {
                this.sendToAllMembers('setMotions', data);
            });
        }
        return motions;
    }

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members.some((member) => member.id == userId);
    }
}
