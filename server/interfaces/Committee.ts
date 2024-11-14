import { Motion } from './motion';
import { Motions } from './motions';
import { Users as UsersClass } from './users';

let Users: UsersClass;

export class Committee {
    public readonly id: string;
    public name: string;
    // @ts-expect-error description not set in constructor
    public description: string;
    public owner: string;
    public members: { id: string, role: string}[];
    public MotionsClass: Motions;

    constructor(id: any, name: any, owner: any, members: any) {
        if (!Users) {
            Users = UsersClass.instance;
        }

        this.id = id;
        this.name = name;
        this.owner = owner;
        this.members = JSON.parse(members);
        this.MotionsClass = new Motions(id);
    }

    public sendToAllMembers(event: string, data: any): void {
        for (const member of this.members) {
            let user = Users.findUserById(member.id)
            if (user) {
                if(user.socket) {
                    user.socket.emit(event, data);
                } else {
                    console.log(`Cannot send to ${user.displayname} because socket is undefined`)
                }
            }
        }
    }

    public sendToAllMembersExcept(event: string, data: any, userId: string): void {
        for (const member in this.members) {
            if (member !== userId) {
                let user = Users.findUserById(member)
                if (user) {
                    if(user.socket) {
                        user.socket.emit(event, data);
                    } else {
                        console.log(`Cannot send to ${user.displayname} because socket is undefined`)
                    }
                }
            }
        }
    }

    public getMotions(updateClients: boolean): Promise<Motion[]> {
        let motions = this.MotionsClass.getMotions();
        console.log(motions)
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
