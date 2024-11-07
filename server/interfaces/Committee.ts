import { Motions } from './motions';
import { User } from './user';
import { Users as UsersClass } from './users';

let Users: UsersClass;

export class Committee {
    public readonly id: string;
    public name: string;
    public description: string;
    public owner: string;
    public members: object;
    public MotionsClass: Motions;

    constructor(id, name, owner, members) {
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
        for (const member in this.members) {
            let user = Users.findUserById(member)
            if (user) {
                user.socket.emit(event, data);
            }
        }
    }

    public sendToAllMembersExcept(event: string, data: any, userId: string): void {
        for (const member in this.members) {
            if (member !== userId) {
                let user = Users.findUserById(member)
                if (user) {
                    user.socket.emit(event, data);
                }
            }
        }
    }

    public getMotions(updateClients: boolean): Promise<any> {
        let motions = this.MotionsClass.getMotions();
        if (updateClients) {
            motions.then((data) => {
                this.sendToAllMembers('setMotions', data);
            });
        }
        return motions;
    }

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members[userId] !== undefined;
    }
}
