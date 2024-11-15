import {nanoid} from "nanoid";
import { MySQL } from '../db';
import { Motion } from './motion';
import { Motions as MotionsClass } from './motions';
import { User } from './user';
import { Users as UsersClass } from './users';

const sql = MySQL.getInstance();
let dbReady = false;
let Users: UsersClass;
sql.ready(async function () {
	dbReady = true;
});

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
    public description: string;
    public owner: string;
    public members: object;
    public Motions: MotionsClass;

    constructor(id, name, owner, members) {
        if (!Users) {
            Users = UsersClass.instance;
        }

        this.id = id;
        this.name = name;
        this.owner = owner;
        this.members = JSON.parse(members);
        this.Motions = new MotionsClass(id, this);
		this.Motions.getMotions(); // Populate motions (We can put notifications on the list of committees if a motion needs attention)
    }

    public sendToAllMembers(event: string, data: any): void {
        for (const member in this.members) {
			const user = Users.findUserById(member)
            if (user) {
                user.socket.emit(event, data);
            }
        }
    }

    public sendToAllMembersExcept(event: string, data: any, userId: string): void {
        for (const member in this.members) {
            if (member !== userId) {
                const user = Users.findUserById(member)
                if (user) {
                    user.socket.emit(event, data);
                }
            }
        }
    }

    public getMotions(updateClients: boolean): Promise<any> {
        const motions = this.Motions.getMotions();
        if (updateClients) {
            motions.then((data) => {
                this.sendToAllMembers('setMotions', data);
            });
        }
        return motions;
    }

	public getMotionById(id: string): Motion | undefined {
		return this.Motions.findMotion(id);
	}

	public canUserDoAction(userId: string, action: string): boolean {
		const user = Users.findUserById(userId);
		if (user) {
			if (userId === this.owner) {
				// Owners can do everything
				return true;
			}

			const member = this.members[userId];
			if (member) {
				// this is the permission system for committees
				if (action === 'createMotion') {
					return true;
				}
			}else {
				console.log('User not member');
			}
		}else {
			console.log('User not found');
		}
		return false;
	}



	public async createMotion(userId: string, title: string): Promise<string> {
		if (!dbReady) {
			const promi = new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve();
				}, 1000);
			});
			await promi;
			return this.createMotion(userId, title);
		}


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
			decisionTime: Date.now() + (7 * 24 * 60 * 60 * 1000),
			creationDate: Date.now()
		}

		await this.Motions.createMotion(info);
		return id;
	}

	// public setUserMotionSocketEvents()

    public isMember(userId: string): boolean {
        return this.owner === userId || this.members[userId] !== undefined;
    }
}
